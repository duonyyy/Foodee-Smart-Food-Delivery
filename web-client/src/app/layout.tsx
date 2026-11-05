import { AuthProvider } from "@/context/auth-context";
import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import React from "react";
import "../styles/globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Foodee - Giao Đồ Ăn Trực Tuyến",
  description:
    "Ứng dụng giao đồ ăn trực tuyến, nhanh chóng và tiện lợi. Trải nghiệm theo dõi đơn hàng và toạ độ shipper thời gian thực.",
  keywords:
    "giao đồ ăn, đặt món online, ứng dụng giao hàng, đồ ăn nhanh, dịch vụ giao đồ ăn, foodee",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Foodee",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

/**
 * RootLayout: wraps the entire app, sets fonts, PWA registration, and AuthProvider.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${beVietnamPro.className} ${beVietnamPro.variable} antialiased`}>
        <AuthProvider>
          {children}
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
