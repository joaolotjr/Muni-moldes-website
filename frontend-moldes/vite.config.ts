import { defineConfig, loadEnv } from 'vite'; // 👈 Import loadEnv
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Change default export to an asynchronous function
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (e.g., 'development' or 'production')
  // The third argument '' is necessary to load all env vars, even those not prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      // Use the loaded 'env' object here
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  }
});