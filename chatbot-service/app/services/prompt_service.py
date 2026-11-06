import json
import re
import unicodedata

from app.models.chat_request import ChatHistoryItem, ChatMenuItem


class PromptService:
    """Builds prompts for LLM calls.

    Ported from: foodee-be/src/modules/chat/services/chat-prompt.service.ts
    """

    @staticmethod
    def _normalize(text: str) -> str:
        text = unicodedata.normalize("NFD", text.casefold().replace("đ", "d"))
        text = "".join(char for char in text if unicodedata.category(char) != "Mn")
        return re.sub(r"[^a-z0-9]+", " ", text).strip()

    @classmethod
    def select_menu_candidates(
        cls, user_message: str, menu_flat: list[ChatMenuItem], limit: int
    ) -> list[ChatMenuItem]:
        """Rank the complete menu by name match, then fill unused slots in menu order."""
        message = f" {cls._normalize(user_message)} "
        if any(phrase in message for phrase in (" re nhat ", " gia thap nhat ", " gia re nhat ")):
            return sorted(menu_flat, key=lambda item: item.price)[:limit]
        message_tokens = set(message.split())
        ranked: list[tuple[int, int, ChatMenuItem]] = []
        remainder: list[ChatMenuItem] = []
        for index, item in enumerate(menu_flat):
            name = cls._normalize(item.name)
            name_tokens = set(name.split())
            exact = bool(name) and f" {name} " in message
            overlap = len(name_tokens & message_tokens)
            if exact or overlap:
                score = (1000 + len(name_tokens)) if exact else overlap * 10 - len(name_tokens)
                ranked.append((score, index, item))
            else:
                remainder.append(item)
        ranked.sort(key=lambda row: (-row[0], row[1]))
        return ([item for _, _, item in ranked] + remainder)[:limit]

    @staticmethod
    def build_order_items_prompt(
        user_message: str,
        menu_flat: list[ChatMenuItem],
        history: list[ChatHistoryItem] | None = None,
    ) -> str:
        """Build prompt to extract order items from user message with context."""
        context_query = user_message
        history_section = ""
        if history:
            recent_texts = [f"- {'Khách' if h.role == 'user' else 'MiXiBot'}: {h.text}" for h in history[-6:]]
            history_section = "Lịch sử trò chuyện gần nhất:\n" + "\n".join(recent_texts) + "\n\n"
            context_query = f"{' '.join([h.text for h in history[-2:]])} {user_message}"

        menu_json = json.dumps(
            [item.model_dump() for item in PromptService.select_menu_candidates(context_query, menu_flat, 15)],
            ensure_ascii=False,
        )
        return (
            f"{history_section}"
            f'Người dùng: "{user_message}"\n\n'
            f"Danh sách một số món có sẵn: {menu_json}\n\n"
            "Nhiệm vụ: Trích xuất các món và số lượng người dùng muốn đặt.\n"
            "Nếu người dùng nói ngắn gọn ('có', 'ok', 'lấy món này', 'đặt luôn') để đồng ý với câu hỏi gợi ý của MiXiBot trong lịch sử, hãy trích xuất món ăn vừa được nhắc tới trong lịch sử với số lượng 1.\n"
            "Trả về JSON array món người dùng muốn đặt (nếu không tìm thấy thì []):\n"
            '[{"id":"...", "name":"...", "quantity":1, "restaurantId":"..."}]\n\n'
            "Chỉ trả JSON."
        )

    @staticmethod
    def build_general_reply_prompt(
        user_message: str,
        menu_flat: list[ChatMenuItem],
        history: list[ChatHistoryItem] | None = None,
    ) -> str:
        """Build prompt for general chat reply with conversational context."""
        context_query = user_message
        if history:
            recent_user_texts = [h.text for h in history[-3:] if h.role == "user"]
            context_query = f"{' '.join(recent_user_texts)} {user_message}"

        menu_json = json.dumps(
            [item.model_dump() for item in PromptService.select_menu_candidates(context_query, menu_flat, 15)],
            ensure_ascii=False,
        )

        history_section = ""
        if history:
            formatted_turns = [
                f"- {'Khách' if h.role == 'user' else 'MiXiBot'}: {h.text}"
                for h in history[-8:]
            ]
            history_section = "Lịch sử trò chuyện gần nhất:\n" + "\n".join(formatted_turns) + "\n\n"

        return (
            "Bạn là MiXiBot, trợ lý đặt món thông minh của Foodee. "
            "Trả lời ngắn gọn, tự nhiên, thân thiện bằng tiếng Việt.\n\n"
            f"{history_section}"
            f'Khách nói: "{user_message}"\n\n'
            f"Thực đơn có sẵn: {menu_json}\n\n"
            "Trả về đúng định dạng JSON:\n"
            "{\n"
            '  "reply": "Câu trả lời ngắn bằng tiếng Việt",\n'
            '  "suggestions": [],\n'
            '  "action": null\n'
            "}\n\n"
            "Quy tắc quan trọng:\n"
            "1. TUYỆT ĐỐI KHÔNG tự bịa hoặc chèn các đường dẫn URL (như http://localhost... hoặc /food/...) vào câu trả lời 'reply'.\n"
            "2. Khi khách bày tỏ ý muốn đặt món hoặc đồng ý chọn món vừa trao đổi (ví dụ nói 'có', 'ok', 'tôi muốn đặt...', 'cho mình 1 phần...'):\n"
            "   - Đặt 'action': 'orderItems'\n"
            "   - Đưa món ăn tương ứng vào mảng 'suggestions': [{'id': '...', 'name': '...', 'price': ...}]\n"
            "   - Trong 'reply', hãy xác nhận tên món và mời khách tiếp tục xác nhận tạo đơn.\n"
            "3. Không tự xưng là đã tạo đơn hay đã trừ tiền.\n"
            "4. Dựa vào lịch sử trò chuyện để hiểu rõ ngữ cảnh của các câu nói ngắn (ví dụ khách nói 'Có' sau khi MiXiBot hỏi 'Bạn có muốn đặt món này không?' thì hiểu là khách đồng ý đặt món đó).\n"
            "Chỉ trả JSON, không thêm bất kỳ giải thích nào khác."
        )
