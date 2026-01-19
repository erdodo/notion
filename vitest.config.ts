import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    // plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), './src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/tests-e2e/**'],
    },
})
