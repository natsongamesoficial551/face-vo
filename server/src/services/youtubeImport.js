import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { config } from '../config.js';
import { ffmpegPath } from './transcode.js';

const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com']);

export async function importYoutubeVideo(url, workDir, id) {
  assertYoutubeUrl(url);
  const info = await getYoutubeInfo(url);
  const duration = Number(info.duration || 0);
  const durationLimit = String(url).includes('/shorts/') ? config.youtubeShortsMaxDurationSec : config.youtubeMaxDurationSec;
  if (duration > durationLimit) {
    throw new Error(`Vídeo muito longo (${Math.round(duration)}s). Limite: ${durationLimit}s.`);
  }

  const base = path.join(workDir, `${id}-youtube`);
  const outputTemplate = `${base}.%(ext)s`;
  await cleanupTempFiles(workDir, `${id}-youtube`);
  await runYtDlp([
    '--no-playlist',
    '--no-warnings',
    '--force-overwrites',
    '--ffmpeg-location', path.dirname(ffmpegPath),
    '-f', 'bv*[vcodec^=avc1][ext=mp4][height<=1080]+ba[ext=m4a]/b[vcodec^=avc1][ext=mp4][height<=1080]/best[height<=1080]',
    '--merge-output-format', 'mp4',
    '-o', outputTemplate,
    url
  ], config.youtubeDownloadTimeoutMs);

  const downloadedPath = await findMergedDownloadedFile(workDir, `${id}-youtube`);
  return {
    inputPath: downloadedPath,
    title: cleanText(info.title) || 'Vídeo do YouTube',
    author: cleanText(info.uploader || info.channel) || 'YouTube',
    durationSec: Math.round(duration || 0),
    thumbnail: bestThumbnail(info),
    sourceUrl: url
  };
}

export async function searchYoutubeShorts(query, limit = config.youtubeSearchCandidates) {
  const safeQuery = buildShortsQuery(query);
  const raw = await runYtDlp([
    '--dump-single-json',
    '--flat-playlist',
    '--skip-download',
    `ytsearch${limit}:${safeQuery}`
  ], 45000);
  const data = JSON.parse(raw);
  const entries = Array.isArray(data.entries) ? data.entries : [];
  const seen = new Set();
  return entries.map(normalizeSearchEntry).filter(candidate => {
    if (!candidate.url || seen.has(candidate.url)) return false;
    seen.add(candidate.url);
    if (candidate.durationSec && candidate.durationSec > config.youtubeShortsMaxDurationSec) return false;
    return candidate.url.includes('/shorts/') || !candidate.durationSec || candidate.durationSec <= config.youtubeShortsMaxDurationSec;
  });
}

export function candidateToReviewVideo(candidate, body) {
  const query = cleanText(body.query);
  return {
    id: 'candidate',
    title: candidate.title || 'Short do YouTube',
    description: candidate.description || body.description || `Candidato encontrado por busca automática: ${query}`,
    category: body.category || 'Positivo',
    author: candidate.author || 'YouTube',
    sourceNote: `Busca automática de Shorts pelo administrador | Pesquisa: ${query} | URL: ${candidate.url}`,
    screenshotNote: 'Pré-triagem por metadados do YouTube; revisar visualmente antes de publicar.',
    order: 0,
    date: new Date().toLocaleDateString('pt-BR'),
    adminPublished: false,
    ai: { decision: 'PENDING', reason: 'Candidato de busca automática.' }
  };
}

export async function downloadThumbnail(url, outputPath) {
  if (!url) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(outputPath, buf);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function getYoutubeInfo(url) {
  const stdout = await runYtDlp(['--dump-single-json', '--no-playlist', '--skip-download', url], 30000);
  return JSON.parse(stdout);
}

function assertYoutubeUrl(raw) {
  let parsed;
  try { parsed = new URL(raw); } catch { throw new Error('Link do YouTube inválido.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use um link http/https do YouTube.');
  if (!youtubeHosts.has(parsed.hostname.toLowerCase())) throw new Error('Por segurança, só aceito links do YouTube/YouTube Shorts.');
}

async function findMergedDownloadedFile(dir, prefix) {
  const files = await fs.readdir(dir);
  const mediaFiles = files
    .filter(f => f.startsWith(prefix) && ['.mp4', '.mkv', '.webm'].includes(path.extname(f).toLowerCase()))
    .filter(f => !/\.f\d+\./i.test(f));
  const hit = mediaFiles.find(f => f === `${prefix}.mp4`) || mediaFiles[0];
  if (!hit) throw new Error('yt-dlp terminou, mas o arquivo final com áudio e vídeo não foi encontrado.');
  return path.join(dir, hit);
}

async function cleanupTempFiles(dir, prefix) {
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.filter(f => f.startsWith(prefix)).map(f => fs.rm(path.join(dir, f), { force: true })));
  } catch {}
}

function runYtDlp(args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(config.ytDlpPath, args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('yt-dlp demorou demais e foi interrompido.'));
    }, timeoutMs);
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', err => {
      clearTimeout(timer);
      reject(new Error(`Não consegui executar yt-dlp (${config.ytDlpPath}): ${err.message}`));
    });
    child.on('close', code => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(cleanYtDlpError(stderr || stdout) || `yt-dlp saiu com código ${code}`));
    });
  });
}

function cleanYtDlpError(output) {
  const text = String(output || '');
  const errorLine = text.split(/\r?\n/).find(line => line.includes('ERROR:'));
  if (errorLine) return errorLine.replace(/^ERROR:\s*/i, '').trim().slice(0, 240);
  return text.replace(/WARNING:[^\n]+\n?/gi, '').trim().slice(-240);
}

function buildShortsQuery(query) {
  const base = cleanText(query);
  return `${base} #shorts`.trim();
}

function normalizeSearchEntry(entry) {
  const rawUrl = entry.webpage_url || entry.url || '';
  const id = entry.id || videoIdFromUrl(rawUrl);
  const url = id ? `https://www.youtube.com/shorts/${id}` : rawUrl;
  const thumb = bestThumbnail(entry);
  return {
    id: String(id || ''),
    url,
    title: cleanText(entry.title) || 'Short do YouTube',
    description: cleanText(entry.description || ''),
    author: cleanText(entry.uploader || entry.channel) || 'YouTube',
    durationSec: Math.round(Number(entry.duration || 0)),
    thumbnail: thumb
  };
}

function bestThumbnail(info) {
  const thumbnails = Array.isArray(info.thumbnails) ? info.thumbnails : [];
  return thumbnails.at(-1)?.url || info.thumbnail || '';
}

function videoIdFromUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.hostname === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || '';
    if (u.pathname === '/watch') return u.searchParams.get('v') || '';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'shorts' || parts[0] === 'embed') return parts[1] || '';
  } catch {}
  return '';
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 180);
}
