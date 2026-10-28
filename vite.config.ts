import { appViteConfig } from "@maat-apps/config/vite";
import { defineConfig } from "vite";

// React, the PWA (src/sw.ts), the GitHub Pages 404 fallback, the base path
// (DEPLOY_BASE_PATH, else /music-scales/), the @ alias and Tailwind — all
// @maat-apps/config's.
export default defineConfig(
  appViteConfig({ name: "music-scales", root: import.meta.dirname }),
);
