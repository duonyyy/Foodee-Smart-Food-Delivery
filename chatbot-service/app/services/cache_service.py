from collections import OrderedDict
import hashlib
import json
import threading
import time
from typing import Any


class ChatCacheService:
    """Thread-safe L1 LRU cache with optional L2 Redis backing for Chatbot prompts & Q&A."""

    def __init__(
        self,
        max_entries: int = 512,
        ttl_seconds: int = 300,
        redis_url: str = "",
    ):
        self.max_entries = max(1, max_entries)
        self.ttl_seconds = max(0, ttl_seconds)
        self._l1: OrderedDict[str, tuple[str, float]] = OrderedDict()
        self._lock = threading.Lock()
        self._hits = 0
        self._misses = 0
        self._redis = None

        if redis_url:
            try:
                import redis.asyncio as aioredis  # type: ignore

                self._redis = aioredis.from_url(redis_url, decode_responses=True)
            except Exception:
                self._redis = None

    @staticmethod
    def build_key(namespace: str, prompt: str) -> str:
        digest = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
        return f"chatbot:{namespace}:{digest}"

    async def get(self, key: str) -> Any | None:
        if not key or self.ttl_seconds <= 0:
            return None

        now = time.monotonic()
        with self._lock:
            entry = self._l1.get(key)
            if entry is not None:
                raw, expires_at = entry
                if now <= expires_at:
                    self._l1.move_to_end(key)
                    self._hits += 1
                    try:
                        return json.loads(raw)
                    except Exception:
                        del self._l1[key]
                else:
                    del self._l1[key]

        if self._redis is not None:
            try:
                raw_redis = await self._redis.get(key)
                if raw_redis:
                    parsed = json.loads(raw_redis)
                    self._set_l1(key, raw_redis)
                    with self._lock:
                        self._hits += 1
                    return parsed
            except Exception:
                pass

        with self._lock:
            self._misses += 1
        return None

    async def set(self, key: str, value: Any, ttl_seconds: int | None = None) -> None:
        ttl = self.ttl_seconds if ttl_seconds is None else ttl_seconds
        if not key or ttl <= 0:
            return

        try:
            serialized = json.dumps(value, ensure_ascii=False)
        except Exception:
            return

        self._set_l1(key, serialized, ttl)

        if self._redis is not None:
            try:
                await self._redis.set(key, serialized, ex=ttl)
            except Exception:
                pass

    def _set_l1(self, key: str, serialized: str, ttl_seconds: int | None = None) -> None:
        ttl = self.ttl_seconds if ttl_seconds is None else ttl_seconds
        expires_at = time.monotonic() + ttl
        with self._lock:
            if key in self._l1:
                self._l1.move_to_end(key)
            elif len(self._l1) >= self.max_entries:
                self._l1.popitem(last=False)
            self._l1[key] = (serialized, expires_at)

    def clear(self) -> None:
        with self._lock:
            self._l1.clear()
            self._hits = 0
            self._misses = 0

    def stats(self) -> dict[str, int]:
        with self._lock:
            return {
                "hits": self._hits,
                "misses": self._misses,
                "size": len(self._l1),
                "max_entries": self.max_entries,
            }

