import { defineConfig } from 'vite';

export default defineConfig({
  root: 'examples/vanilla',
  // URL base harus sesuai dengan nama repository GitHub Anda agar aset bisa diload
  base: '/elalert/',
  build: {
    outDir: '../../docs-dist',
    emptyOutDir: true,
  },
});
