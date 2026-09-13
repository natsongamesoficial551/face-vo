import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const apiBaseUrl = String(process.env.API_BASE_URL || '').trim().replace(/\/$/, '');
if (!apiBaseUrl) throw new Error('Defina API_BASE_URL com a URL pública da API no Render.');

const parsed = new URL(apiBaseUrl);
if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('API_BASE_URL deve usar http ou https.');

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(scriptDir, '..', 'public', 'config.js');
await fs.writeFile(outputPath, `window.FACEVO_CONFIG = ${JSON.stringify({ API_BASE_URL: apiBaseUrl }, null, 2)};\n`, 'utf8');
console.log(`Configuração pública gerada para ${parsed.origin}.`);
