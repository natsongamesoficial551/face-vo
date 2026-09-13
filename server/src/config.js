import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || '0.0.0.0',
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 8787}`).replace(/\/$/, ''),
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim().replace(/\/$/, '')).filter(Boolean),
  adminApiKey: process.env.ADMIN_API_KEY || process.env.DEVICE_KEY || '',
  aiBaseUrl: (process.env.AI_BASE_URL || 'http://127.0.0.1:20128/v1').replace(/\/$/, ''),
  aiApiKey: process.env.AI_API_KEY || '',
  aiModel: process.env.AI_MODEL || '',
  aiVision: String(process.env.AI_VISION || 'true').toLowerCase() !== 'false',
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS || 45000),
  autoPublishOnAiApprove: String(process.env.AUTO_PUBLISH_ON_AI_APPROVE || 'false').toLowerCase() === 'true',
  ffmpegPath: process.env.FFMPEG_PATH || '',
  ytDlpPath: process.env.YTDLP_PATH || 'yt-dlp',
  youtubeMaxDurationSec: Number(process.env.YT_MAX_DURATION_SEC || 180),
  youtubeDownloadTimeoutMs: Number(process.env.YT_DOWNLOAD_TIMEOUT_MS || 180000),
  youtubeSearchCandidates: Number(process.env.YT_SEARCH_CANDIDATES || 200),
  youtubeSearchTarget: Number(process.env.YT_SEARCH_TARGET || 100),
  youtubeShortsMaxDurationSec: Number(process.env.YT_SHORTS_MAX_DURATION_SEC || 90),
};
