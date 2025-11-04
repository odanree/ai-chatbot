import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load environment variables from .env.local  
config({ path: resolve(__dirname, '.env.local') });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
