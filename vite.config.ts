import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";
import { VitePWA } from "vite-plugin-pwa";

const commitHash = execSync("git rev-parse HEAD").toString().trim();

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
      pwaAssets: {
        disabled: false,
        image: "public/vaultoy_count_logo_with_bg.svg",
        overrideManifestIcons: true,
      },
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
        icons: [], // Generated in pwaAssets configuration above
      },
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
