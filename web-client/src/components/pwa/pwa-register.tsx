"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registered successfully:", registration.scope);
          })
          .catch((error) => {
            console.warn("[PWA] Service Worker registration failed:", error);
          });
      });
    }

    // 2. Request Notification Permission if supported and not denied
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        // Auto-request or user gesture request
        const timer = setTimeout(() => {
          Notification.requestPermission().catch(() => {});
        }, 5000);
        return () => clearTimeout(timer);
      }
    }

    // 3. Catch BeforeInstallPromptEvent for PWA install banner
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt on mobile devices
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Cài đặt Ứng dụng Foodee</h4>
            <p className="text-[11px] text-muted-foreground">Nhận thông báo đơn hàng tức thì trên điện thoại</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="h-8 px-3 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90"
          >
            Cài đặt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstallBanner(false)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

