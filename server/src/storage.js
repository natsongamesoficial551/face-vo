import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.resolve(__dirname, '..');
export const dataDir = path.resolve(process.env.DATA_DIR || path.join(rootDir, 'data'));
export const videosDir = path.join(dataDir, 'videos');
export const thumbsDir = path.join(dataDir, 'thumbs');
export const screenshotsDir = path.join(dataDir, 'screenshots');
export const tmpDir = path.join(dataDir, 'tmp');
const dbPath = path.join(dataDir, 'catalog.json');

let db = { version: 1, videos: [] };

export async function initStorage() {
  await fs.mkdir(videosDir, { recursive: true });
  await fs.mkdir(thumbsDir, { recursive: true });
  await fs.mkdir(screenshotsDir, { recursive: true });
  await fs.mkdir(tmpDir, { recursive: true });
  try {
    db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
  } catch {
    await saveDb();
  }
}

export function getDb() {
  return structuredClone(db);
}

export async function saveDb(next = db) {
  db = next;
  db.version = Number(db.version || 0) + 1;
  const tmp = `${dbPath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tmp, dbPath);
}

export async function mutate(mutator) {
  const next = structuredClone(db);
  const result = await mutator(next);
  await saveDb(next);
  return result;
}

export function publicVideo(video, publicBaseUrl) {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnail: video.thumb || '',
    videoUrl: `${publicBaseUrl}/media/${video.file}`,
    thumbUrl: video.thumb ? `${publicBaseUrl}/media/${video.thumb}` : '',
    category: video.category,
    author: video.author,
    date: video.date,
    approved: Boolean(video.adminPublished && video.ai?.decision === 'APPROVE'),
    order: video.order,
    sourceNote: video.sourceNote || '',
    screenshotNote: video.screenshotNote || '',
    autoApproved: video.ai?.decision === 'APPROVE',
    reviewStatus: statusText(video.ai?.decision),
    reviewReason: video.ai?.reason || ''
  };
}

export function statusText(decision) {
  if (decision === 'APPROVE') return 'APROVADO IA';
  if (decision === 'REJECT') return 'REPROVADO IA';
  if (decision === 'REVIEW') return 'REVISAR MANUAL';
  if (decision === 'ERROR') return 'ERRO IA';
  return 'PENDENTE';
}
