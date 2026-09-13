import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { getDb, initStorage, mutate, publicVideo, statusText, videosDir, thumbsDir, screenshotsDir, tmpDir, dataDir } from './storage.js';
import { reviewVideo } from './services/aiReview.js';
import { transcodeForAndroid } from './services/transcode.js';
import { candidateToReviewVideo, downloadThumbnail, importYoutubeVideo, searchYoutubeShorts } from './services/youtubeImport.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: tmpDir, limits: { fileSize: 500 * 1024 * 1024 } });

app.use(cors({
  origin(origin, callback) {
    if (!origin || config.corsOrigins.length === 0 || config.corsOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origem não permitida por CORS.'));
  }
}));
app.use(express.json({ limit: '2mb' }));
app.use('/', express.static(path.join(__dirname, '..', 'public')));
app.use('/media/videos', express.static(videosDir, { acceptRanges: true, maxAge: '1d', fallthrough: false }));
app.use('/media/thumbs', express.static(thumbsDir, { maxAge: '1d', fallthrough: false }));
app.use('/media/screenshots', express.static(screenshotsDir, { maxAge: '1d', fallthrough: false }));

app.get('/health', (_req, res) => res.json({ ok: true, dbVersion: getDb().version, aiConfigured: Boolean(config.aiBaseUrl && config.aiModel), publicBaseUrl: config.publicBaseUrl }));
app.get('/api/health', (_req, res) => res.json({ ok: true, dbVersion: getDb().version, aiConfigured: Boolean(config.aiBaseUrl && config.aiModel) }));

app.get('/api/catalog', (_req, res) => {
  const db = getDb();
  const videos = db.videos
    .filter(v => v.adminPublished && v.ai?.decision === 'APPROVE')
    .sort((a,b) => a.order - b.order)
    .map(v => publicVideo(v, config.publicBaseUrl));
  res.json({ version: db.version, videos });
});
app.get('/api/catalog/approved', (_req, res) => {
  const db = getDb();
  const videos = db.videos
    .filter(v => v.adminPublished && v.ai?.decision === 'APPROVE')
    .sort((a,b) => a.order - b.order)
    .map(v => publicVideo(v, config.publicBaseUrl));
  res.json({ version: db.version, videos });
});

app.use('/api/admin', (req, res, next) => {
  if (!config.adminApiKey || req.get('X-Admin-Key') === config.adminApiKey) return next();
  return res.status(401).json({ error: 'Chave administrativa inválida.' });
});

app.get('/api/admin/videos', (_req, res) => res.json(getDb()));

app.post('/api/admin/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'screenshot', maxCount: 1 }]), async (req, res, next) => {
  try {
    const file = req.files?.video?.[0];
    if (!file) return res.status(400).json({ error: 'Envie um arquivo de vídeo.' });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const originalName = `${id}-original${path.extname(file.originalname || '.mp4').toLowerCase() || '.mp4'}`;
    const videoName = `${id}.mp4`;
    const originalPath = path.join(videosDir, originalName);
    const outputPath = path.join(videosDir, videoName);
    await fs.rename(file.path, originalPath);
    await transcodeForAndroid(originalPath, outputPath);
    await fs.rm(originalPath, { force: true });

    let screenshotRel = '';
    const screenshot = req.files?.screenshot?.[0];
    if (screenshot) {
      const shotExt = ['.jpg','.jpeg','.png','.webp'].includes(path.extname(screenshot.originalname || '').toLowerCase()) ? path.extname(screenshot.originalname).toLowerCase() : '.jpg';
      const shotName = `${id}${shotExt}`;
      await fs.rename(screenshot.path, path.join(screenshotsDir, shotName));
      screenshotRel = `screenshots/${shotName}`;
    }

    const order = (getDb().videos.reduce((m, v) => Math.max(m, Number(v.order || 0)), 0) + 1);
    const video = {
      id,
      title: req.body.title || 'Sem título',
      description: req.body.description || 'Vídeo importado pelo administrador',
      category: req.body.category || 'Positivo',
      author: req.body.author || 'Administrador',
      sourceNote: req.body.sourceNote || 'Arquivo local curado pelo administrador',
      screenshotNote: req.body.screenshotNote || '',
      file: `videos/${videoName}`,
      thumb: screenshotRel,
      screenshot: screenshotRel,
      sizeBytes: file.size,
      durationSec: 0,
      order,
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString(),
      ai: { decision: 'PENDING', reason: 'Aguardando análise.', flags: [], matchedCategory: '', model: config.aiModel, reviewedAt: '' },
      adminPublished: false
    };
    const ai = await reviewVideo(video);
    video.ai = { ...ai, model: config.aiModel || 'fallback-local', reviewedAt: new Date().toISOString() };
    if (config.autoPublishOnAiApprove && ai.decision === 'APPROVE') video.adminPublished = true;
    await mutate(db => { db.videos.push(video); });
    res.json({ ok: true, video });
  } catch (err) { next(err); }
});

app.post('/api/admin/import-youtube', async (req, res, next) => {
  try {
    const url = String(req.body.url || '').trim();
    if (!url) return res.status(400).json({ error: 'Informe o link do YouTube.' });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const videoName = `${id}.mp4`;
    const outputPath = path.join(videosDir, videoName);
    const imported = await importYoutubeVideo(url, tmpDir, id);
    await transcodeForAndroid(imported.inputPath, outputPath);
    await fs.rm(imported.inputPath, { force: true });

    let screenshotRel = '';
    const thumbUrl = `https://img.youtube.com/vi/${youtubeIdFromUrl(url)}/hqdefault.jpg`;
    const shotName = `${id}.jpg`;
    if (youtubeIdFromUrl(url) && await downloadThumbnail(thumbUrl, path.join(screenshotsDir, shotName))) {
      screenshotRel = `screenshots/${shotName}`;
    }

    const stat = await fs.stat(outputPath);
    const order = (getDb().videos.reduce((m, v) => Math.max(m, Number(v.order || 0)), 0) + 1);
    const video = {
      id,
      title: req.body.title || imported.title,
      description: req.body.description || 'Vídeo curado por link do YouTube.',
      category: req.body.category || 'Positivo',
      author: req.body.author || imported.author,
      sourceNote: req.body.sourceNote || `Link curado pelo administrador: ${url}`,
      screenshotNote: req.body.screenshotNote || '',
      file: `videos/${videoName}`,
      thumb: screenshotRel,
      screenshot: screenshotRel,
      sizeBytes: stat.size,
      durationSec: imported.durationSec,
      order,
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toISOString(),
      sourceUrl: url,
      ai: { decision: 'PENDING', reason: 'Aguardando análise.', flags: [], matchedCategory: '', model: config.aiModel, reviewedAt: '' },
      adminPublished: false
    };
    const ai = await reviewVideo(video);
    video.ai = { ...ai, model: config.aiModel || 'fallback-local', reviewedAt: new Date().toISOString() };
    if (config.autoPublishOnAiApprove && ai.decision === 'APPROVE') video.adminPublished = true;
    await mutate(db => { db.videos.push(video); });
    res.json({ ok: true, video });
  } catch (err) { next(err); }
});

app.post('/api/admin/search-shorts', async (req, res, next) => {
  try {
    const query = String(req.body.query || '').trim();
    if (!query) return res.status(400).json({ error: 'Informe o filtro/pesquisa para buscar Shorts.' });
    const targetCount = Math.max(1, Math.min(Number(req.body.targetCount || config.youtubeSearchTarget || 100), 100));
    const candidates = await searchYoutubeShorts(query, config.youtubeSearchCandidates);
    const imported = [];
    const skipped = [];
    const existing = new Set(getDb().videos.map(v => v.sourceUrl).filter(Boolean));

    for (const candidate of candidates) {
      if (imported.length >= targetCount) break;
      if (existing.has(candidate.url)) {
        skipped.push({ title: candidate.title, url: candidate.url, reason: 'Já existe no catálogo.' });
        continue;
      }
      const reviewDraft = candidateToReviewVideo(candidate, req.body);
      const preReview = await reviewVideo(reviewDraft);
      const positiveLocalSignals = ['planta','plantas','jardim','jardinagem','horta','flor','flores','natureza','trabalho','manual','artesanato','receita','culinaria','culinária','paisagem','animal','animais','positivo','calmo','tranquilo','musica','música','instrumental','educacao','educação','educativo','educativa','aprendizado','curiosidade','diversao educativa','diversão educativa'];
      const hasPositiveSignal = positiveLocalSignals.some(w => [reviewDraft.title, reviewDraft.description, reviewDraft.category].join(' ').toLowerCase().includes(w));
      const reviewOnlyBecauseVisual = preReview.decision === 'REVIEW' && /visual|frame|frames|metadados|confirmar|revis/i.test(preReview.reason || '');
      if (preReview.decision !== 'APPROVE' && !(hasPositiveSignal && reviewOnlyBecauseVisual)) {
        skipped.push({ title: candidate.title, url: candidate.url, reason: preReview.reason || 'Não passou na triagem segura.' });
        continue;
      }
      if (preReview.decision !== 'APPROVE') {
        preReview.decision = 'APPROVE';
        preReview.reason = `${preReview.reason || 'Metadados positivos.'} Importado oculto para revisão manual antes de publicar.`;
        preReview.flags = [...(preReview.flags || []), 'manual_review_required'];
      }
      try {
        const video = await importYoutubeCandidate(candidate, req.body, preReview);
        imported.push(video);
        existing.add(candidate.url);
      } catch (error) {
        skipped.push({ title: candidate.title, url: candidate.url, reason: error.message || 'Erro ao baixar/converter.' });
      }
    }

    res.json({
      ok: true,
      imported,
      skipped,
      message: `Importei ${imported.length} Short${imported.length === 1 ? '' : 's'} seguro${imported.length === 1 ? '' : 's'} como oculto${imported.length === 1 ? '' : 's'}. ${skipped.length} candidato${skipped.length === 1 ? '' : 's'} pulado${skipped.length === 1 ? '' : 's'}.`
    });
  } catch (err) { next(err); }
});

async function importYoutubeCandidate(candidate, body, preReview) {
  const url = candidate.url;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const videoName = `${id}.mp4`;
  const outputPath = path.join(videosDir, videoName);
  const imported = await importYoutubeVideo(url, tmpDir, id);
  await transcodeForAndroid(imported.inputPath, outputPath);
  await fs.rm(imported.inputPath, { force: true });

  let screenshotRel = '';
  const shotName = `${id}.jpg`;
  const thumbUrl = candidate.thumbnail || `https://img.youtube.com/vi/${youtubeIdFromUrl(url)}/hqdefault.jpg`;
  if (await downloadThumbnail(thumbUrl, path.join(screenshotsDir, shotName))) {
    screenshotRel = `screenshots/${shotName}`;
  }

  const stat = await fs.stat(outputPath);
  const order = (getDb().videos.reduce((m, v) => Math.max(m, Number(v.order || 0)), 0) + 1);
  const video = {
    id,
    title: body.title || imported.title || candidate.title,
    description: body.description || `Short importado por busca automática: ${String(body.query || '').trim()}`,
    category: body.category || 'Positivo',
    author: body.author || imported.author || candidate.author,
    sourceNote: body.sourceNote || `Busca automática de Shorts: ${String(body.query || '').trim()} | URL: ${url}`,
    screenshotNote: body.screenshotNote || 'Importado automaticamente como oculto; revisar antes de publicar.',
    file: `videos/${videoName}`,
    thumb: screenshotRel,
    screenshot: screenshotRel,
    sizeBytes: stat.size,
    durationSec: imported.durationSec || candidate.durationSec || 0,
    order,
    date: new Date().toLocaleDateString('pt-BR'),
    createdAt: new Date().toISOString(),
    sourceUrl: url,
    ai: { ...preReview, model: config.aiModel || 'fallback-local', reviewedAt: new Date().toISOString() },
    adminPublished: false
  };
  await mutate(db => { db.videos.push(video); });
  return video;
}

function youtubeIdFromUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.hostname === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || '';
    if (u.pathname === '/watch') return u.searchParams.get('v') || '';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'shorts' || parts[0] === 'embed') return parts[1] || '';
  } catch {}
  return '';
}

app.patch('/api/admin/videos/:id', async (req, res) => {
  let updated;
  await mutate(db => {
    const v = db.videos.find(x => x.id === req.params.id);
    if (!v) return;
    for (const key of ['title','description','category','author','sourceNote','screenshotNote']) if (key in req.body) v[key] = String(req.body[key]);
    if ('adminPublished' in req.body) v.adminPublished = Boolean(req.body.adminPublished) && v.ai?.decision === 'APPROVE';
    updated = v;
  });
  if (!updated) return res.status(404).json({ error: 'Vídeo não encontrado.' });
  res.json({ ok: true, video: updated });
});

app.post('/api/admin/videos/:id/review', async (req, res) => {
  let video = getDb().videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Vídeo não encontrado.' });
  const ai = await reviewVideo(video);
  await mutate(db => {
    const v = db.videos.find(x => x.id === req.params.id);
    v.ai = { ...ai, model: config.aiModel || 'fallback-local', reviewedAt: new Date().toISOString() };
    if (ai.decision !== 'APPROVE') v.adminPublished = false;
    video = v;
  });
  res.json({ ok: true, video });
});

app.post('/api/admin/videos/:id/approve', async (req, res) => {
  let video;
  await mutate(db => {
    const v = db.videos.find(x => x.id === req.params.id);
    if (!v) return;
    if (v.ai?.decision === 'APPROVE') v.adminPublished = true;
    video = v;
  });
  if (!video) return res.status(404).json({ error: 'Vídeo não encontrado.' });
  if (!video.adminPublished) return res.status(409).json({ error: 'A IA ainda não aprovou este vídeo. Ele permanece oculto.' });
  res.json({ ok: true, video });
});

app.post('/api/admin/videos/:id/reject', async (req, res) => {
  let video;
  await mutate(db => { const v = db.videos.find(x => x.id === req.params.id); if (v) { v.adminPublished = false; video = v; } });
  if (!video) return res.status(404).json({ error: 'Vídeo não encontrado.' });
  res.json({ ok: true, video });
});

app.post('/api/admin/videos/:id/move', async (req, res) => {
  const delta = Number(req.body.delta || 0);
  await mutate(db => {
    const list = db.videos.sort((a,b) => a.order - b.order);
    const i = list.findIndex(v => v.id === req.params.id);
    const j = Math.max(0, Math.min(list.length - 1, i + delta));
    if (i >= 0 && i !== j) { const [v] = list.splice(i, 1); list.splice(j, 0, v); list.forEach((v, idx) => v.order = idx + 1); }
  });
  res.json({ ok: true });
});

app.delete('/api/admin/videos/:id', async (req, res) => {
  let removed;
  await mutate(db => { const i = db.videos.findIndex(v => v.id === req.params.id); if (i >= 0) removed = db.videos.splice(i, 1)[0]; });
  if (!removed) return res.status(404).json({ error: 'Vídeo não encontrado.' });
  for (const rel of [removed.file, removed.thumb, removed.screenshot].filter(Boolean)) await fs.rm(path.join(dataDir, rel), { force: true });
  res.json({ ok: true });
});

app.post('/api/admin/ai/test', async (_req, res) => {
  res.json({ ok: Boolean(config.aiBaseUrl && config.aiModel), aiBaseUrl: config.aiBaseUrl, aiModel: config.aiModel || '(não configurado)' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Erro interno.' });
});

await initStorage();
app.listen(config.port, config.host, () => console.log(`FaceVo server: ${config.publicBaseUrl} (local ${config.host}:${config.port})`));
