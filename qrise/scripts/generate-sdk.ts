import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const rootDir = join(__dirname, '..');
  const specPath = join(rootDir, 'public', 'api', 'openapi.yaml');
  const sdkDir = join(rootDir, 'sdk');
  
  // Create sdk directory if it doesn't exist
  try {
    mkdirSync(sdkDir, { recursive: true });
  } catch {}

  console.log('⏳ Generating TypeScript types from OpenAPI spec...');
  
  try {
    // Run openapi-typescript CLI
    execSync(`npx openapi-typescript ${specPath} -o ${join(sdkDir, 'types.ts')}`, {
      stdio: 'inherit',
    });
    
    console.log('✅ Types generated in sdk/types.ts');

    // Generate client.ts
    const clientContent = `import createClient from 'openapi-fetch';
import type { paths } from './types';

/**
 * QRise API Client
 * 
 * Usage:
 * const client = createClient<paths>({ baseUrl: 'https://app.qrise.app/api/v1' });
 * const { data, error } = await client.GET('/qr');
 */
export const client = createClient<paths>({ 
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://app.qrise.app/api/v1',
});

export default client;
`;

    writeFileSync(join(sdkDir, 'client.ts'), clientContent);
    console.log('✅ Client skeleton created in sdk/client.ts');
    
  } catch (error) {
    console.error('❌ SDK generation failed:', error);
    process.exit(1);
  }
}

main();
