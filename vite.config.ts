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
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cacheId: 'snap-flex-v1.01',
      },
      manifest: {
        name: 'Snap-Flex',
        short_name: 'SnapFlex',
        start_url: '/snap-flex/',
        scope: '/snap-flex/',
        description: 'Knee Flexion Angle Measurement',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a'
      }
    })
  ]
});
