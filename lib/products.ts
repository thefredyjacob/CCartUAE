import productsRaw from "@/mockdata/mock-products.json";
import detailRaw from "@/mockdata/product-detail.json";
import tagsRaw from "@/mockdata/product-tags.json";

// Single source of truth for the catalog. mockdata/*.json is the real product
// data; the scraped Framer markup is only a design template (this is a phone
// accessories store, not the audio/TV shop the template was built for).

// The raw feed uses deep retail breadcrumbs ("Mobiles & Tablets > Mobile
// Accessories > Batteries & Chargers"). Curate them into a handful of buckets
// that work as filter facets — keyed on the breadcrumb's LEAF segment.
const CATEGORY_BUCKETS: Record<string, string> = {
  "Batteries & Chargers": "Chargers & Power Banks",
  "Car Mobile Chargers & Holders": "Chargers & Power Banks",
  "Power Banks": "Chargers & Power Banks",
  Mobiles: "Phones",
  Cables: "Cables & Adapters",
  "Cables & Adapters": "Cables & Adapters",
  "Earphones & Headphones": "Audio",
  "Wireless Speakers": "Audio",
  "Mobile Accessories": "Accessories",
};

function leafCategory(breadcrumb: string): string {
  return breadcrumb.split(">").pop()!.trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// pimcdn takes resize params in the URL — the feed ships 300x300 thumbs, so ask
// for something sharper. Idempotent: safe to call on an already-upscaled url.
function upscale(url: string, size: number, quality = 85) {
  return url.replace(
    /width=\d+,height=\d+,fit=pad(?:,format=webp,quality=\d+)?/,
    `width=${size},height=${size},fit=pad,format=webp,quality=${quality}`
  );
}

type RawProduct = (typeof productsRaw)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  regularPrice: number;
  currency: string;
  inStock: boolean;
  rating: number | null;
  reviewCount: number | null;
  image: string;
};

const slugCounts = new Map<string, number>();
function uniqueSlug(name: string, id: string): string {
  const base = slugify(name) || id;
  const n = slugCounts.get(base) ?? 0;
  slugCounts.set(base, n + 1);
  return n === 0 ? base : `${base}-${id}`;
}

export const PRODUCTS: Product[] = (productsRaw as RawProduct[]).map((p) => {
  const leaf = leafCategory(p.category);
  const category = CATEGORY_BUCKETS[leaf];
  if (!category) throw new Error(`unmapped category leaf: "${leaf}" (${p.name})`);
  return {
    id: p.id,
    slug: uniqueSlug(p.name, p.id),
    name: p.name,
    brand: p.brand,
    category,
    price: p.price,
    regularPrice: p.regularPrice,
    currency: p.currency,
    inStock: p.inStock,
    rating: p.rating,
    reviewCount: p.reviewCount,
    image: upscale(p.image, 800),
  };
});

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

// Merchandising tags live in their own seed file (mockdata/product-tags.json) so
// the product feed stays untouched — a CMS can own this mapping later. Ids are
// resolved eagerly and throw on a miss: a bad id would otherwise just silently
// shorten a homepage row.
function byTag(ids: string[], tag: string): Product[] {
  return ids.map((id) => {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) throw new Error(`product-tags.json: "${tag}" references unknown product id "${id}"`);
    return p;
  });
}

export const BEST_SELLERS: Product[] = byTag(tagsRaw.bestSellers, "bestSellers");
export const NEW_ARRIVALS: Product[] = byTag(tagsRaw.newArrivals, "newArrivals");

export type Facet = { label: string; slug: string; count: number };

// Facets are derived from the catalog itself, so filter options can never drift
// out of sync with what's actually on the shelf.
function facets(pick: (p: Product) => string): Facet[] {
  const counts = new Map<string, number>();
  for (const p of PRODUCTS) counts.set(pick(p), (counts.get(pick(p)) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, slug: slugify(label), count }));
}

export const CATEGORY_FACETS: Facet[] = facets((p) => p.category);
export const BRAND_FACETS: Facet[] = facets((p) => p.brand);

export type ProductDetail = {
  gallery: string[];
  specifications: { label: string; value: string }[];
};

// Only one product in the feed ships a full detail record (gallery + specs);
// the rest fall back to their listing image and the fields we do have.
export function getProductDetail(product: Product): ProductDetail {
  if (product.id === detailRaw.id) {
    return {
      gallery: detailRaw.gallery.map((g) => g.replace("quality=70", "quality=85")),
      specifications: detailRaw.specifications,
    };
  }
  return {
    gallery: [upscale(product.image, 1000)],
    specifications: [
      { label: "Brand", value: product.brand },
      { label: "Category", value: product.category },
    ],
  };
}
