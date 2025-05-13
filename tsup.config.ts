import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['modules/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [/^internal/],
  noExternal: ['gl-matrix'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    }
  },
}) 