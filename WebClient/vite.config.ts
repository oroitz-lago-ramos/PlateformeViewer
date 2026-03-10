import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Serves Brotli-compressed Unity build files with the correct Content-Encoding header.
// Unity's loader requests e.g. UnityBuild.framework.js — the actual file on disk is
// UnityBuild.framework.js.br — so we intercept the request and serve the .br file.
const unityBrotliPlugin = {
  name: 'unity-brotli',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      const brPath = path.resolve(__dirname, 'public', (req.url as string).slice(1) + '.br');
      if (fs.existsSync(brPath)) {
        res.setHeader('Content-Encoding', 'br');
        if (req.url.endsWith('.js'))   res.setHeader('Content-Type', 'application/javascript');
        else if (req.url.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
        else                           res.setHeader('Content-Type', 'application/octet-stream');
        res.end(fs.readFileSync(brPath));
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), unityBrotliPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
