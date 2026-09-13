const $ = sel => document.querySelector(sel);
const library = $('#library');
const form = $('#uploadForm');
const youtubeForm = $('#youtubeForm');
const shortsSearchForm = $('#shortsSearchForm');
const apiBaseUrl = String(window.FACEVO_CONFIG?.API_BASE_URL || '').replace(/\/$/, '');
let adminApiKey = '';

function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

async function api(path, options = {}) {
  const requestOptions = { ...options, headers: new Headers(options.headers || {}) };
  if (path.startsWith('/api/admin') && adminApiKey) requestOptions.headers.set('X-Admin-Key', adminApiKey);
  let res = await fetch(apiUrl(path), requestOptions);
  if (res.status === 401 && path.startsWith('/api/admin')) {
    adminApiKey = prompt('Informe a chave administrativa da API:') || '';
    if (adminApiKey) {
      requestOptions.headers.set('X-Admin-Key', adminApiKey);
      res = await fetch(apiUrl(path), requestOptions);
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function load() {
  const health = await api('/health');
  $('#serverUrl').textContent = health.publicBaseUrl;
  const db = await api('/api/admin/videos');
  const approved = db.videos.filter(v => v.adminPublished && v.ai?.decision === 'APPROVE').length;
  $('#summary').textContent = `${db.videos.length} vídeos • ${approved} publicados no APK`;
  library.innerHTML = db.videos.sort((a,b)=>a.order-b.order).map(card).join('') || `<div class="panel">Nenhum vídeo ainda. Importe um MP4 seguro acima.</div>`;
}

function card(v) {
  const decision = v.ai?.decision || 'PENDING';
  const cls = decision === 'APPROVE' ? 'ok' : decision === 'REJECT' || decision === 'ERROR' ? 'bad' : decision === 'REVIEW' ? 'review' : 'pending';
  const label = decision === 'APPROVE' ? 'APROVADO IA' : decision === 'REJECT' ? 'REPROVADO IA' : decision === 'REVIEW' ? 'REVISAR MANUAL' : decision === 'ERROR' ? 'ERRO IA' : 'PENDENTE';
  return `<article class="card">
    <div class="thumb">${v.thumb ? `<img src="${apiUrl(`/media/${esc(v.thumb)}`)}" alt="thumbnail">` : '▶'}</div>
    <div class="card-body">
      <p class="title">${esc(v.title)}</p>
      <div class="meta">${esc(v.category)} • ${esc(v.author)} • ordem ${v.order}</div>
      <span class="chip ${cls}">${label}</span>${v.adminPublished ? '<span class="chip ok">PUBLICADO</span>' : '<span class="chip pending">OCULTO</span>'}
      <p class="desc">${esc(v.description)}</p>
      <div class="reason">${esc(v.ai?.reason || 'Aguardando análise')}</div>
      ${v.file ? `<div class="reason">Arquivo: <a href="${apiUrl(`/media/${esc(v.file)}`)}" target="_blank" rel="noopener">/media/${esc(v.file)}</a></div>` : ''}
      <div class="actions">
        <button onclick="review('${v.id}')">Analisar IA</button>
        <button onclick="approve('${v.id}')">Publicar</button>
        <button onclick="reject('${v.id}')">Ocultar</button>
        <button onclick="move('${v.id}',-1)">↑</button>
        <button onclick="move('${v.id}',1)">↓</button>
        <button class="danger" onclick="delVideo('${v.id}')">Remover</button>
      </div>
    </div>
  </article>`;
}

function esc(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true; btn.textContent = 'Enviando e analisando...';
  try { await api('/api/admin/upload', { method: 'POST', body: new FormData(form) }); form.reset(); await load(); }
  catch (err) { alert(err.message); }
  finally { btn.disabled = false; btn.textContent = 'Enviar e analisar com IA'; }
});

shortsSearchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = shortsSearchForm.querySelector('button');
  btn.disabled = true; btn.textContent = 'Pesquisando, analisando e importando...';
  const body = Object.fromEntries(new FormData(shortsSearchForm).entries());
  body.targetCount = Number(body.targetCount || 100);
  try {
    const result = await api('/api/admin/search-shorts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    shortsSearchForm.reset();
    await load();
    const skipped = (result.skipped || []).slice(0, 5).map(v => `• ${v.title}: ${v.reason}`).join('\n');
    alert(`${result.message}${skipped ? `\n\nPulados:\n${skipped}` : ''}`);
  }
  catch (err) { alert(err.message); }
  finally { btn.disabled = false; btn.textContent = 'Buscar, analisar e importar oculto'; }
});

youtubeForm.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = youtubeForm.querySelector('button');
  btn.disabled = true; btn.textContent = 'Baixando, convertendo e analisando...';
  const body = Object.fromEntries(new FormData(youtubeForm).entries());
  try {
    await api('/api/admin/import-youtube', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
    youtubeForm.reset();
    await load();
  }
  catch (err) { alert(err.message); }
  finally { btn.disabled = false; btn.textContent = 'Importar link e analisar'; }
});

async function review(id){ await api(`/api/admin/videos/${id}/review`, {method:'POST'}); load(); }
async function approve(id){ try { await api(`/api/admin/videos/${id}/approve`, {method:'POST'}); load(); } catch(e){ alert(e.message); } }
async function reject(id){ await api(`/api/admin/videos/${id}/reject`, {method:'POST'}); load(); }
async function move(id,delta){ await api(`/api/admin/videos/${id}/move`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({delta})}); load(); }
async function delVideo(id){ if(confirm('Remover este vídeo e arquivos?')){ await api(`/api/admin/videos/${id}`, {method:'DELETE'}); load(); } }

$('#testAiBtn').onclick = async () => { const r = await api('/api/admin/ai/test', {method:'POST'}); alert(`IA: ${r.ok ? 'configurada' : 'não configurada'}\n${r.aiBaseUrl}\nModelo: ${r.aiModel}`); };
load().catch(err => { library.innerHTML = `<div class="panel danger">Erro: ${esc(err.message)}</div>`; });
