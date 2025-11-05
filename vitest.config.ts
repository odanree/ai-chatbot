import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load environment variables
// In CI: uses .env.test
// Locally: uses .env.local
const envPath = process.env.NODE_ENV === 'test' 
  ? resolve(__dirname, '.env.test')
  : resolve(__dirname, '.env.local');

config({ path: envPath });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
