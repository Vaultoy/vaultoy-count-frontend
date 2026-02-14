import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";

const commitHash = execSync("git rev-parse HEAD").toString().trim();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    COMMIT_HASH: JSON.stringify(commitHash),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
