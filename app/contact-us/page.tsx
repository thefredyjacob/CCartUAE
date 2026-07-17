import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { getPageHtml } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us - Customer Support & Inquiries | HiFi Store",
  description:
    "Get in touch with HiFi Store's expert support team. 24/7 customer service for product questions, orders, returns and technical assistance. We're here to help.",
};

export default function ContactUs() {
  return <PageShell html={getPageHtml("contact-us")} />;
}
