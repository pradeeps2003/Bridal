import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Glow with Rubi — Bridal Makeup Artist",
    short_name: "Glow with Rubi",
    description:
      "Bridal HD makeup, reception, engagement, party looks, saree draping in Pollachi, Coimbatore & Tamil Nadu.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6f2",
    theme_color: "#c48a6a",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
