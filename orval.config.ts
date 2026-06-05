import { defineConfig } from "orval";

export default defineConfig({
  gr8BooksLite: {
    input: {
      target: "../gr8bookslite-backend/openapi.json",
    },
    output: {
      target: "app/src/generated/api",
      mode: "tags-split",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./app/src/services/shared/api/OrvalApiClient.ts",
          name: "OrvalApiClient",
        },
      },
    },
  },
});
