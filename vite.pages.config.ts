import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const projectRoot = __dirname;
const base = '/caroline-goncalves-2/';

export default defineConfig({
  root: path.join(projectRoot, 'static-preview'),
  base,
  define: { 'process.env.NEXT_PUBLIC_STATIC_SITE': JSON.stringify('true'), 'process.env.NEXT_PUBLIC_SCHEDULING_URL': JSON.stringify('') },
  publicDir: path.join(projectRoot, 'public'),
  css: { postcss: projectRoot },
  resolve: {
    alias: [
      { find: 'next/link', replacement: path.join(projectRoot, 'static-preview/shims/link.tsx') },
      { find: 'next/navigation', replacement: path.join(projectRoot, 'static-preview/shims/navigation.ts') },
      { find: 'next/dynamic', replacement: path.join(projectRoot, 'static-preview/shims/dynamic.tsx') },
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
