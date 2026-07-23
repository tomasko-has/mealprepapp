"use client";

import Script from "next/script";

interface ChatWidgetProps {
  serverUrl?: string;
  business?: string;
  accent?: string;
  welcome?: string;
}

export default function ChatWidget({
  serverUrl = "https://mealprepapp-11vk.onrender.com",
  business = "Ora Nutrition",
  accent = "#059669",
  welcome = "Hi! I'm your nutrition assistant. Ask me about meals, macros, or how to use the app 🥗",
}: ChatWidgetProps) {
  return (
    <Script
      src={`${serverUrl}/public/widget.js`}
      data-business={business}
      data-accent={accent}
      data-welcome={welcome}
      strategy="afterInteractive"
    />
  );
}
