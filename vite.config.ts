import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";
import { VitePWA } from "vite-plugin-pwa";

const commitHash =
  process.env.NODE_ENV === "production"
    ? execSync("git rev-parse HEAD").toString().trim()
    : "dev";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "vaultoy_count_logo.svg",
        "vaultoy_count_logo_with_bg.svg",
        "vaultoy_count_logo_adaptative.svg",
        "at.png",
      ],
      manifest: {
        id: "com.vaultoy.count",
        name: "Vaultoy Count",
        short_name: "Vaultoy Count",
        description: "Privately split expenses with end-to-end encryption.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      /*
      This config was used to generate the icons. Now, they are in the public folder.
      The apple-touch-icon was modified manually.

      pwaAssets: {
        disabled: false,
        image: "public/vaultoy_count_logo_with_bg.svg",
        overrideManifestIcons: false,
        includeHtmlHeadLinks: false,
      }, */
    }),
  ],
  define: {
    COMMIT_HASH: JSON.stringify(commitHash),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
