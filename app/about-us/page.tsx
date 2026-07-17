import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { getPageHtml } from "@/lib/site";

export const metadata: Metadata = {
  title: "About HiFi Store - Your Trusted Electronics & Audio Expert",
  description:
    "Learn about HiFi Store's commitment to quality electronics and exceptional customer service. Discover why thousands trust us for headphones, speakers, TVs and audio equipment.",
};

export default function AboutUs() {
  return <PageShell html={getPageHtml("about-us")} />;
}
