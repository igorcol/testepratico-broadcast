import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 10_000,
    env: { FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' },
  },
})