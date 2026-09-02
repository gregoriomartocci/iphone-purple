import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Cubrimos la lógica pura: precios, filtros, canje y armado de links.
      // Las páginas son composición y se validan con el build.
      include: ["lib/**/*.ts", "utils/**/*.ts", "components/site/**/*.tsx"],
      exclude: ["lib/supabase/**", "lib/data/supabase.ts", "lib/data/admin.ts"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
});
