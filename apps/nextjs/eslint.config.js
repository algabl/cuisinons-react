import baseConfig, { restrictEnvAccess } from "@cuisinons/eslint-config/base";
import nextjsConfig from "@cuisinons/eslint-config/nextjs";
import reactConfig from "@cuisinons/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
];
