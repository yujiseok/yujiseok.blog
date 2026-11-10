import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // .tsx 를 빠뜨리면 컴포넌트 테스트를 추가해도 조용히 실행에서 빠진다
    include: [
      "lib/**/*.test.ts?(x)",
      "app/**/*.test.ts?(x)",
      "figma/**/*.test.ts",
    ],
  },
  resolve: {
    alias: { "@": import.meta.dirname },
  },
});
