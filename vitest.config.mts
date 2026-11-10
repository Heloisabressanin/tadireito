import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolves the "@/..." alias declared in tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    // The calculation engine is pure TypeScript: no DOM needed yet.
    environment: 'node',
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
  },
});
