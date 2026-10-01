import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const projectRoot = __dirname;
const base = '/caroline-goncalves-1/';

export default defineConfig({
  root: path.join(projectRoot, 'pages'),
  base,
  publicDir: path.join(projectRoot, 'public'),
  css: { postcss: projectRoot },
  resolve: {
    alias: [
      { find: 'next/link', replacement: path.join(projectRoot, 'pages/shims/link.tsx') },
      { find: 'next/navigation', replacement: path.join(projectRoot, 'pages/shims/navigation.ts') },
      { find: 'next/dynamic', replacement: path.join(projectRoot, 'pages/shims/dynamic.tsx') },
      { find: '@', replacement: projectRoot },
    ],
  },
  plugins: [
    react(),
    {
      name: 'pages-public-image-paths',
      enforce: 'pre',
      transform(source, id) {
        const filename = id.split('?')[0].replaceAll('\\', '/');
        if (!filename.startsWith(projectRoot.replaceAll('\\', '/') + '/') ||
            !/(?:\/components\/|\/data\/).+\.[jt]sx?$/.test(filename)) return;
        return source.replace(/(["'])\/images\//g, `$1${base}images/`);
      },
    },
  ],
  build: { outDir: path.join(projectRoot, 'dist-pages'), emptyOutDir: true },
});
