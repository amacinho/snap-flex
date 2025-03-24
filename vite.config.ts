import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import fs from 'fs';
import path from 'path';

const certPath = path.resolve(__dirname, './certificates');
const cert = fs.readFileSync(path.join(certPath, 'cert.pem'));
const key = fs.readFileSync(path.join(certPath, 'key.pem'));


export default defineConfig({
  base: '/snap-flex/', 
  server: {
    https: {
      cert,
      key
    },
    host: '0.0.0.0'
  },
  plugins: [react()],
});
/*
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Check if SSL certificates exist
const certPath = path.resolve(__dirname, './certificates');
const hasCerts = fs.existsSync(path.join(certPath, 'cert.pem')) && 
                fs.existsSync(path.join(certPath, 'key.pem'));

export default defineConfig({
  base: '/snap-flex/',
  build: {
    manifest: true, // Generate manifest
  },
  server: {
    // Enable HTTPS if certificates exist
    https: hasCerts ? {
      key: fs.readFileSync(path.join(certPath, 'key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
    } : undefined,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
  ],
});
*/