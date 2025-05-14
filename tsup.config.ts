import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {'a5': 'modules/index.ts'},
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [/^internal/],
  noExternal: ['gl-matrix'],
  globalName: 'A5',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : format === 'iife' ? '.umd.js' : '.js',
    }
  }
}) 