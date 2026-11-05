import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.auth import require_service_token
from app.config import get_settings
from app.models.chat_request import GeneralReplyRequest, ParseOrderItemsRequest
from app.models.chat_response import GeneralReplyResponse, ParseOrderItemsResponse
from app.services.cache_service import ChatCacheService
from app.services.llm_service import LlmProviderError, LlmService
from app.services.prompt_service import PromptService
from app.services.response_parser import LlmOutputError, ResponseParser

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Service instances
_settings = get_settings()
_llm_service = LlmService()
_prompt_service = PromptService()
_parser = ResponseParser()
_cache = ChatCacheService(
    max_entries=_settings.chat_cache_max_entries,
    ttl_seconds=_settings.chat_cache_ttl_seconds,
    redis_url=_settings.redis_url,
)


@router.get("/health")
async def health_check():
    """Health check endpoint for the chat AI service."""
    return {"status": "ok", "cache": _cache.stats()}


@router.post("/general-reply", response_model=GeneralReplyResponse, dependencies=[Depends(require_service_token)])
async def general_reply(request: GeneralReplyRequest):
    """Generate a general chat reply using LLM with semantic prompt caching.

    Flow: build prompt → check cache → call LLM → parse response → store cache → return JSON.
    """
    try:
        prompt = _prompt_service.build_general_reply_prompt(
            request.userMessage, request.menuFlat
        )
        cache_key = _cache.build_key("general_reply", prompt)
        cached = await _cache.get(cache_key)
        if cached is not None:
            return GeneralReplyResponse.model_validate(cached)

        raw = await _llm_service.call_llm(prompt)
        result = _parser.parse_general_reply(raw)
        await _cache.set(cache_key, result.model_dump())
        return result

    except LlmProviderError as exc:
        print(f"[/api/chat/general-reply] Provider error: {exc.code}, upstream_status={exc.upstream_status}")
        raise HTTPException(
            status_code=exc.status_code,
            detail={"code": exc.code, "upstream_status": exc.upstream_status},
        ) from None
    except LlmOutputError:
        raise HTTPException(status_code=502, detail={"code": "invalid_llm_output"}) from None
    except Exception as exc:
        print(f"[/api/chat/general-reply] Error: {type(exc).__name__}")
        raise HTTPException(
            status_code=500,
            detail="Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
        )


@router.post("/general-reply/stream", dependencies=[Depends(require_service_token)])
async def general_reply_stream(request: GeneralReplyRequest):
    """Stream general chat reply via Server-Sent Events (SSE) for sub-second First Token Time (FTT)."""
    prompt = _prompt_service.build_general_reply_prompt(
        request.userMessage, request.menuFlat
    )
    cache_key = _cache.build_key("general_reply", prompt)

    async def event_generator():
        try:
            cached = await _cache.get(cache_key)
            if cached is not None:
                validated = GeneralReplyResponse.model_validate(cached)
                for chunk in _llm_service._chunk_text(validated.reply, 20):
                    yield f"data: {json.dumps({'event': 'delta', 'text': chunk}, ensure_ascii=False)}\n\n"
                yield f"data: {json.dumps({'event': 'done', 'data': validated.model_dump(), 'cached': True}, ensure_ascii=False)}\n\n"
                return

            chunks: list[str] = []
            async for chunk in _llm_service.stream_llm(prompt):
                chunks.append(chunk)
                yield f"data: {json.dumps({'event': 'delta', 'text': chunk}, ensure_ascii=False)}\n\n"

            raw = "".join(chunks)
            result = _parser.parse_general_reply(raw)
            await _cache.set(cache_key, result.model_dump())
            yield f"data: {json.dumps({'event': 'done', 'data': result.model_dump(), 'cached': False}, ensure_ascii=False)}\n\n"
        except LlmProviderError as exc:
            yield f"data: {json.dumps({'event': 'error', 'code': exc.code, 'status_code': exc.status_code}, ensure_ascii=False)}\n\n"
        except LlmOutputError:
            yield f"data: {json.dumps({'event': 'error', 'code': 'invalid_llm_output', 'status_code': 502}, ensure_ascii=False)}\n\n"
        except Exception:
            yield f"data: {json.dumps({'event': 'error', 'code': 'internal_error', 'status_code': 500}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/parse-order-items", response_model=ParseOrderItemsResponse, dependencies=[Depends(require_service_token)])
async def parse_order_items(request: ParseOrderItemsRequest):
    """Parse user message to extract order items using LLM with caching.

    Flow: build prompt → check cache → call LLM → parse response → store cache → return order items.
    """
    try:
        prompt = _prompt_service.build_order_items_prompt(
            request.userMessage, request.menuFlat
        )
        cache_key = _cache.build_key("parse_order_items", prompt)
        cached = await _cache.get(cache_key)
        if cached is not None:
            return ParseOrderItemsResponse.model_validate(cached)

        raw = await _llm_service.call_llm(prompt)
        items = _parser.parse_order_items(raw)
        response = ParseOrderItemsResponse(orderItems=items)
        await _cache.set(cache_key, response.model_dump())
        return response

    except LlmProviderError as exc:
        print(f"[/api/chat/parse-order-items] Provider error: {exc.code}, upstream_status={exc.upstream_status}")
        raise HTTPException(
            status_code=exc.status_code,
            detail={"code": exc.code, "upstream_status": exc.upstream_status},
        ) from None
    except LlmOutputError:
        raise HTTPException(status_code=502, detail={"code": "invalid_llm_output"}) from None
    except Exception as exc:
        print(f"[/api/chat/parse-order-items] Error: {type(exc).__name__}")
        raise HTTPException(
            status_code=500,
            detail="Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
        )
