import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import MobileNav from "@/components/MobileNav";
import LiveChat from "@/components/LiveChat";
import CarouselArrows from "@/components/CarouselArrows";

const svgTemplates = fs.readFileSync(path.join(process.cwd(), "content", "svg-templates.html"), "utf8");

export const metadata: Metadata = {
  title: "HiFi Store - Premium Electronics & Audio Equipment | Headphones, Speakers & TVs",
  description:
    "Shop premium electronics at HiFi Store. Find top-quality headphones, speakers, amplifiers, TVs and accessories with free shipping, secure payment and expert support. Your trusted audio store.",
  icons: {
    icon: "/images/favico.webp",
    apple: "/images/favico.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: scoped to this element's own attributes only.
    // Browser extensions (ad blockers, dark-mode toggles, etc.) commonly inject a
    // class onto <html> before React hydrates — real mismatch, but not ours to fix.
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <div dangerouslySetInnerHTML={{ __html: svgTemplates }} />
        <SmoothScroll />
        <MobileNav />
        <LiveChat />
        <CarouselArrows />
      </body>
    </html>
  );
}
