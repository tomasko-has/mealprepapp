import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getShopName } from "@/lib/shopify-queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ORA Nutrition | Fresh Meal Prep Delivered",
  description: "Chef-prepared, macro-balanced meals delivered to your door. Choose your plan and fuel your goals.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const shopName = await getShopName();

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar shopName={shopName} />
        <main className="flex-1">{children}</main>
        <Footer shopName={shopName} />
      </body>
    </html>
  );
}


