import fs from 'fs/promises';
import { config } from '../config.js';

const allowed = ['planta','plantas','jardim','jardinagem','horta','flor','flores','natureza','trabalho','manual','artesanato','receita','culinaria','culinária','paisagem','animal','animais','positivo','calmo','tranquilo','musica','música','instrumental','educacao','educação','educativo','educativa','aprendizado','curiosidade','diversao educativa','diversão educativa'];
const blocked = ['namoro','namorar','relacionamento','paquera','encontro','casal','beijo','sensual','sexy','triste','morte','violencia','violência','briga','politica','política','alarme','urgente','golpe','dinheiro facil','dinheiro fácil','pix','aposta','casino','cassino','remedio milagroso','remédio milagroso','desconhecido','desconhecida','amor','saudade','sofrimento','medo','crypto','cripto'];
const faceRisk = ['rosto','selfie','homem falando','mulher falando','cara falando','pessoa falando','olhando para camera','olhando para câmera','chamada','mensagem'];

export async function reviewVideo(video) {
  const local = keywordReview(video);
  if (local.decision === 'REJECT') return local;

  try {
    const ai = await callAi(video);
    return normalizeAi(ai, local);
  } catch (error) {
    if (local.decision === 'APPROVE') {
      return { decision: 'REVIEW', reason: `IA indisponível; sinais positivos existem, mas manter em revisão manual. Erro: ${error.message}`, flags: ['ai_error'], matchedCategory: local.matchedCategory || '' };
    }
    return { decision: 'ERROR', reason: `IA indisponível e sem segurança suficiente para aprovar: ${error.message}`, flags: ['ai_error'], matchedCategory: '' };
  }
}

function keywordReview(video) {
  const text = [video.title, video.description, video.category, video.sourceNote, video.screenshotNote].join(' ').toLowerCase();
  const blockedHits = blocked.filter(w => hasUnsafeTerm(text, w));
  const faceHits = faceRisk.filter(w => hasUnsafeTerm(text, w));
  const allowedHits = allowed.filter(w => text.includes(w));
  if (blockedHits.length) return { decision: 'REJECT', reason: `Bloqueado por regra local: ${blockedHits.join(', ')}`, flags: blockedHits, matchedCategory: '' };
  if (faceHits.length) return { decision: 'REVIEW', reason: `Possível foco em pessoa/rosto: ${faceHits.join(', ')}`, flags: faceHits, matchedCategory: '' };
  if (allowedHits.length) return { decision: 'APPROVE', reason: `Sinais positivos: ${allowedHits.slice(0, 5).join(', ')}`, flags: [], matchedCategory: allowedHits[0] };
  return { decision: 'REVIEW', reason: 'Sem sinais positivos suficientes; revisar manualmente.', flags: [], matchedCategory: '' };
}

function hasUnsafeTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(^|\\W)${escaped}(?=\\W|$)`, 'iu');
  const match = pattern.exec(text);
  if (!match) return false;
  const before = text.slice(Math.max(0, match.index - 18), match.index).toLowerCase();
  if (/\b(sem|não|nao|evitar|bloquear|proibir|nunca|nenhum|nenhuma)\b/.test(before)) return false;
  return true;
}

async function callAi(video) {
  if (!config.aiBaseUrl || !config.aiModel) throw new Error('AI_BASE_URL ou AI_MODEL não configurado');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.aiTimeoutMs);
  try {
    const messages = [{ role: 'system', content: systemPrompt() }, { role: 'user', content: userPrompt(video) }];
    const res = await fetch(`${config.aiBaseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(config.aiApiKey ? { Authorization: `Bearer ${config.aiApiKey}` } : {})
      },
      body: JSON.stringify({ model: config.aiModel, temperature: 0, response_format: { type: 'json_object' }, messages })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return JSON.parse(String(text).replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim());
  } finally {
    clearTimeout(timer);
  }
}

function normalizeAi(ai, local) {
  const raw = String(ai.decision || '').toUpperCase();
  const decision = raw === 'APPROVE' ? 'APPROVE' : raw === 'REJECT' ? 'REJECT' : 'REVIEW';
  if (decision === 'APPROVE' && local.decision !== 'APPROVE') {
    return { decision: 'REVIEW', reason: 'IA aprovou, mas as regras locais não encontraram sinais positivos suficientes; manter em revisão.', flags: ['local_gate'], matchedCategory: '' };
  }
  return {
    decision,
    reason: String(ai.reason || local.reason || 'Análise concluída.'),
    flags: Array.isArray(ai.flags) ? ai.flags.map(String) : [],
    matchedCategory: String(ai.matchedCategory || local.matchedCategory || '')
  };
}

function systemPrompt() {
  return `Você é um revisor conservador de vídeos para um app usado por uma pessoa idosa. Responda somente JSON válido. Aprove apenas conteúdos claramente positivos e calmos: plantas, jardinagem, horta, flores, natureza, trabalho manual, artesanato, culinária simples, paisagens, animais tranquilos, música instrumental leve, educação simples sem polêmica e diversão educativa tranquila. Reprove namoro, relacionamento, paquera, desconhecidos criando vínculo, rosto/pessoa em destaque falando para a câmera, tristeza, morte, violência, política, notícia alarmista, golpes, spam, dinheiro fácil, PIX, apostas, cassino, remédio milagroso, sensualidade e manipulação emocional. Se houver dúvida, use REVIEW, nunca APPROVE. JSON: {"decision":"APPROVE|REJECT|REVIEW","reason":"motivo curto em PT-BR","flags":["sinais"],"matchedCategory":"categoria segura ou vazio"}`;
}

function userPrompt(video) {
  return `Título: ${video.title}\nDescrição: ${video.description}\nCategoria: ${video.category}\nOrigem/permissão: ${video.sourceNote}\nScreenshot/frames: ${video.screenshotNote}\nDecida se pode aparecer no Reels da pessoa idosa.`;
}
