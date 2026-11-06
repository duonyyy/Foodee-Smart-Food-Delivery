"use client";

import { RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import Image from "next/image";

interface ChatHeaderProps {
  onClose: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onResetChat?: () => void;
}

export default function ChatHeader({
  onClose,
  isMuted,
  onToggleMute,
  onResetChat,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:py-3.5">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="relative h-10 w-10 overflow-hidden rounded-2xl bg-primary/10 shadow-xs ring-1 ring-primary/15">
            <Image
              src="/mascot_background_removed.png"
              alt="Foodee Assistant"
              fill
              sizes="40px"
              className="object-cover object-center"
            />
          </div>
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
            aria-label="Đang online"
          />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-950">Foodee Assistant</h2>
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Trợ lý đặt món AI</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={isMuted ? "Bật âm thanh thông báo" : "Tắt âm thanh thông báo"}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}

        {onResetChat && (
          <button
            type="button"
            onClick={onResetChat}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Làm mới hội thoại"
            title="Làm mới hội thoại"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Đóng chatbot"
          title="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
