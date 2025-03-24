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
  server: {
    // Enable HTTPS if certificates exist
    https: hasCerts ? {
      key: fs.readFileSync(path.join(certPath, 'key.pem')),
      cert: fs.readFileSync(path.join(certPath, 'cert.pem')),
    } : undefined,
    host: '0.0.0.0',
    fs: {
      strict: false,
      allow: ['..', '/snap-flex', '/dev-dist']
    }
  },
  plugins: [
    react(),
    VitePWA({
      srcDir: 'public',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      workbox: {
        cacheId: 'snap-flex-v1.02',
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Snap-Flex',
        short_name: 'SnapFlex',
        start_url: '/snap-flex/',
        scope: '/snap-flex/',
        description: 'Knee Flexion Angle Measurement',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/snap-flex/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/snap-flex/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
});
