import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      'a5': path.resolve(__dirname, 'modules'),
      'a5/core': path.resolve(__dirname, 'modules/core')
    }
  }
}) 