import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Audio & Electronics Blog - Tips, Reviews & Guides | HiFi Store",
  description:
    "Expert audio guides, product reviews and electronics tips from HiFi Store. Learn about headphones, speakers, home theater setup and the latest audio technology trends.",
};

export default function Blog() {
  return <PageShell name="blog" />;
}
