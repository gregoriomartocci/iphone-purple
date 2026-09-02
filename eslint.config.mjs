import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "docs/**",
  ]),

  {
    rules: {
      // Las variables sin usar son ruido, salvo que se marquen con _ a propósito
      // (típico al descartar campos con destructuring).
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // `any` apaga el type-checking justo donde más hace falta.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // console.log olvidado en producción; warn/error sí son intencionales.
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },

  {
    // Tests y scripts de CLI sí escriben a consola a propósito.
    files: ["**/*.test.ts", "**/*.test.tsx", "tests/**", "scripts/**"],
    rules: { "no-console": "off" },
  },
]);

export default eslintConfig;
