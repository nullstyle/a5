import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'modules/index.ts'),
      name: 'A5',
      fileName: (format) => `a5.${format}.js`,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'modules/index.ts'),
      },
      output: {
        // No need for globals since we're bundling everything
      },
      // Exclude internal module from build
      external: [/^internal/],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['modules/**/*.ts'],
      exclude: ['modules/internal/**/*.ts'],
    }),
  ],
}); 