import react from '@vitejs/plugin-react'
import { gzipSync, brotliCompressSync } from 'node:zlib'
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

function compressionPlugin(algorithm: 'gzip' | 'brotli', extension: '.gz' | '.br'): Plugin {
  let outputDirectory = 'dist'
  return {
    name: `compress-${algorithm}`,
    apply: 'build',
    configResolved(config) {
      outputDirectory = config.build.outDir
    },
    async closeBundle() {
      const compressDirectory = async (directory: string): Promise<void> => {
        const entries = await readdir(directory, { withFileTypes: true })
        await Promise.all(entries.map(async (entry) => {
          const filePath = join(directory, entry.name)
          if (entry.isDirectory()) {
            await compressDirectory(filePath)
            return
          }
          if (!/\.(?:js|mjs|css|html|svg)$/i.test(entry.name) || /\.(?:gz|br)$/i.test(entry.name)) return
          if ((await stat(filePath)).size < 1024) return
          const contents = await readFile(filePath)
          const compressed = algorithm === 'gzip' ? gzipSync(contents) : brotliCompressSync(contents)
          await writeFile(`${filePath}${extension}`, compressed)
        }))
      }
      await compressDirectory(outputDirectory)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    process.env.ANALYZE === 'true' && visualizer({
      filename: `dist/bundle-analysis-${process.env.ANALYSIS_LABEL || 'current'}.json`,
      template: 'raw-data',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globIgnores: ['**/*.gz', '**/*.br', '**/bundle-analysis-*.json'],
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Artville Gallery of Imagination',
        short_name: 'Artville',
        description: 'Living Digital Art Gallery & Archive',
        theme_color: '#0C0C0D',
        background_color: '#0C0C0D',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    compressionPlugin('gzip', '.gz'),
    compressionPlugin('brotli', '.br'),
  ],
  build: {
    rolldownOptions: {
      preserveEntrySignatures: false,
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'gsap', test: /node_modules[\\/]gsap[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
})
