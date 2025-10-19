import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // allow external connections
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: ['codsoft-2-f8ti.onrender.com'], // your Render domain
  },
});
