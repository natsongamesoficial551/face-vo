# NatanSites

- Site: https://natansites.com.br
- Projeto analisado: FaceVo
- Descricao: A NatanSites desenvolve o FaceVo, uma plataforma de curadoria de videos curtos e seguros para idosos.
- Produto: Painel administrativo para importar, revisar e publicar videos, acompanhado de um aplicativo Android com feed vertical no estilo Reels.
- Publico-alvo: Idosos e seus familiares ou cuidadores.
- Tom de voz: Simples, acolhedor, seguro e direto.
- Estado atual: O servidor e o painel formam um MVP funcional e possuem catalogo real. O aplicativo Android esta incompleto no repositorio atual.
- Principios do produto: Curadoria conservadora, publicacao manual, conteudo calmo e protecao contra golpes, violencia, sensualidade, alarmismo e manipulacao emocional.


- Servidor: Node.js, Express, dashboard web estatico, FFmpeg, yt-dlp e integracao de IA compativel com OpenAI.
- Armazenamento: Catalogo JSON e arquivos de midia locais.
- Android: Kotlin e Media3 ExoPlayer; fontes e recursos principais ainda ausentes.
- Contrato publico principal: `GET /api/catalog` retorna somente videos aprovados e publicados.
- Riscos prioritarios: Rotas administrativas sem autenticacao, curadoria baseada apenas em metadados, exposicao ampla de arquivos e falta de testes/deploy reproduzivel.
