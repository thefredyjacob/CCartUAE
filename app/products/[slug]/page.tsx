import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { PRODUCTS, getProductBySlug, getProductDetail } from "@/lib/products";
import { renderProductDetail } from "@/lib/product-detail-html";

// mockdata/*.json is the product catalog — the 3 originally-scraped pages
// (VisionMax/ThunderBass/HomeSound) were only ever a design reference, already
// captured as content/product-detail-template.html. Every product, scraped-shop
// or mock, renders through that one template now.
export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} - Hifi Shop`, description: `${product.brand} ${product.category}` };
}

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const detail = getProductDetail(product);
  return <PageShell html={renderProductDetail(product, detail)} />;
}
