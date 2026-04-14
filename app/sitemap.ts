import type { MetadataRoute } from "next";
import { allPassports, getCountryMeta } from "@/lib/visa-data";
import { loadBrands } from "@/lib/brand-data";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://maphub.example";

const TASTE_COUNTRIES = [
  "turkey",
  "italy",
  "japan",
  "mexico",
  "india",
  "thailand",
  "france",
  "scotland",
  "greece",
  "vietnam",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const coreRoutes: Array<{
    url: string;
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly";
  }> = [
    { url: "", priority: 1.0, changeFrequency: "weekly" },
    { url: "/maps/iss", priority: 0.9, changeFrequency: "daily" },
    { url: "/maps/iss/how-to-spot", priority: 0.8, changeFrequency: "monthly" },
    { url: "/maps/visa-free", priority: 0.9, changeFrequency: "weekly" },
    { url: "/maps/visa-free/ranking", priority: 0.85, changeFrequency: "weekly" },
    { url: "/maps/hidden-brands", priority: 0.8, changeFrequency: "monthly" },
    { url: "/maps/taste-passport", priority: 0.8, changeFrequency: "weekly" },
    { url: "/maps/pilot-game", priority: 0.85, changeFrequency: "monthly" },
    { url: "/maps/biography", priority: 0.85, changeFrequency: "monthly" },
    { url: "/maps/wars", priority: 0.9, changeFrequency: "monthly" },
    { url: "/maps/wars/turkish-independence", priority: 0.85, changeFrequency: "monthly" },
    { url: "/legal/trademarks", priority: 0.3, changeFrequency: "monthly" },
    { url: "/about", priority: 0.5, changeFrequency: "monthly" },
    { url: "/backlog", priority: 0.4, changeFrequency: "weekly" },
  ];

  const entries: MetadataRoute.Sitemap = coreRoutes.map((r) => ({
    url: BASE + r.url,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const c of TASTE_COUNTRIES) {
    entries.push({
      url: `${BASE}/maps/taste-passport/${c}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Per-passport landing pages
  for (const iso of allPassports()) {
    const meta = getCountryMeta(iso);
    entries.push({
      url: `${BASE}/maps/visa-free/${meta.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    });
    // Inverse: who can visit this destination?
    entries.push({
      url: `${BASE}/maps/visa-free/destination/${meta.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Per-brand landing pages
  for (const b of loadBrands()) {
    entries.push({
      url: `${BASE}/maps/hidden-brands/${b.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  return entries;
}
