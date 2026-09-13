# Deploy do FaceVo

## API no Render

1. Envie o repositório a um provedor Git suportado pelo Render e crie um Blueprint usando `render.yaml`.
2. Preencha `PUBLIC_BASE_URL` com a URL HTTPS final do serviço, sem barra no fim.
3. Preencha `CORS_ORIGINS` com a URL HTTPS final do Netlify. Use vírgulas se houver mais de uma origem.
4. Gere uma chave longa e aleatória para `ADMIN_API_KEY`. O painel a solicita ao operador e a mantém somente em memória durante a página aberta; não coloque essa chave no Netlify.
5. Configure `AI_BASE_URL`, `AI_API_KEY` e `AI_MODEL` como variáveis secretas no Render. Elas nunca devem ser configuradas no Netlify.
6. Mantenha `AUTO_PUBLISH_ON_AI_APPROVE=false`: a aprovação da IA não publica conteúdo; a publicação continua manual pelo painel.

O Blueprint usa Docker, verifica `/health`, desativa deploy automático e monta o disco persistente em `/var/lib/facevo`. O catálogo e as pastas `videos`, `thumbs` e `screenshots` ficam nesse disco. Somente essas três pastas são servidas por `/media`; `catalog.json`, temporários e outros arquivos de `DATA_DIR` não são públicos.

## Painel no Netlify

1. Importe o mesmo repositório no Netlify; `netlify.toml` já define o comando e o diretório de publicação.
2. Crie a variável pública `API_BASE_URL` com a URL HTTPS da API no Render, sem barra no fim.
3. Execute o deploy manual quando desejar publicar uma versão do painel.

O build gera `server/public/config.js`. A variável contém apenas a URL pública da API, nunca a chave administrativa, chaves da IA ou outros segredos. Localmente, `config.js` deixa a URL vazia e o painel continua usando a mesma origem da API em `http://localhost:8787`; `ADMIN_API_KEY` pode ficar vazio somente nesse cenário local.

## Verificação local

```powershell
Set-Location server
npm ci
npm start
```

Abra `http://localhost:8787` e confira `http://localhost:8787/health`. Para validar a imagem sem publicar, execute `docker build -t facevo-api ./server` e inicie-a com um volume montado em `/var/lib/facevo`.
