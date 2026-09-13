# Como adicionar vídeos seguros no FaceVo

## Regra principal

O YouTube/Shorts pode ser usado apenas como fonte de curadoria pelo administrador. O aplicativo da pessoa idosa não abre o feed do YouTube nem carrega Shorts automaticamente: ele só recebe vídeos que você escolheu, importou, analisou e publicou.

Fluxo recomendado por busca automática de Shorts:

```text
Administrador escreve um filtro seguro
        ↓
O servidor pesquisa Shorts no YouTube
        ↓
A IA/regras locais analisam os candidatos antes do download
        ↓
O servidor baixa e converte apenas os aprováveis
        ↓
Todos entram como ocultos no catálogo
        ↓
Administrador revisa e publica manualmente
        ↓
Somente então aparece no Reels do APK
```

Fluxo recomendado por link:

```text
Administrador encontra um vídeo positivo no YouTube/Shorts
        ↓
Confere se o conteúdo é seguro e se pode usar
        ↓
Cola o link no dashboard do FaceVo
        ↓
O servidor baixa e converte para MP4 compatível com Android
        ↓
A IA/regras locais analisam título, descrição, categoria e notas
        ↓
Administrador publica manualmente quando estiver aprovado
        ↓
Somente então aparece no Reels do APK
```

Fluxo alternativo com arquivo local:

```text
Administrador escolhe/cria um vídeo positivo
        ↓
Confere se o conteúdo é seguro e se pode usar
        ↓
Importa o MP4/MOV/WEBM pelo painel administrativo do FaceVo
        ↓
O servidor converte para MP4 compatível com Android
        ↓
Aprova manualmente
        ↓
Somente então aparece no Reels
```

## Conteúdos permitidos

Priorizar vídeos calmos, positivos e simples:

- plantas;
- jardinagem;
- horta;
- flores;
- natureza calma;
- trabalho manual;
- artesanato;
- culinária simples;
- paisagens;
- animais tranquilos;
- música instrumental leve;
- atividades positivas do dia a dia.

## Conteúdos bloqueados

Não adicionar:

- namoro;
- relacionamento;
- paquera;
- desconhecidos falando como se conhecessem a pessoa;
- pessoas/rostos usados para criar vínculo emocional;
- conteúdo triste ou negativo;
- política pesada;
- notícia alarmista;
- golpe;
- spam;
- promessa falsa;
- conteúdo sensual;
- brigas;
- violência;
- manipulação emocional.

## Formato recomendado dos vídeos

Para parecer Shorts/Reels:

```text
Formato final: MP4
Proporção: 9:16 vertical
Resolução final do servidor: 720x1280
Duração sugerida: 10 a 60 segundos
Limite padrão para link do YouTube: 180 segundos
Áudio: leve, sem sustos, sem volume agressivo
```

## Como buscar Shorts automaticamente com IA

1. Abra o dashboard do FaceVo no computador.
2. Vá em `Buscar Shorts com IA`.
3. Escreva um filtro seguro, por exemplo: `plantas no jardim sem pessoas`.
4. Escolha a quantidade máxima, até 100 Shorts.
5. Preencha categoria e regras do que não pode aparecer.
6. Clique em `Buscar, analisar e importar oculto`.
7. Aguarde: a busca pode demorar vários minutos porque baixa e converte os vídeos.
8. Os vídeos entram como `OCULTO`, mesmo quando a IA aprova.
9. Revise os cards no catálogo e clique em `Publicar` somente nos vídeos realmente seguros.

Se a busca encontrar menos Shorts seguros do que o máximo escolhido, ela importa apenas os seguros encontrados.

## Como importar por link do YouTube

1. Abra o dashboard do FaceVo no computador.
2. Vá em `Importar por link do YouTube`.
3. Cole o link do YouTube/Shorts.
4. Preencha categoria e notas do que aparece no vídeo.
5. Clique em `Importar link e analisar`.
6. Aguarde: o servidor baixa, converte e analisa. Pode demorar um pouco.
7. Se aparecer como `APROVADO IA`, clique em `Publicar`.
8. Se ficar em revisão ou reprovar, mantenha oculto ou remova.

## Como importar arquivo local

1. Abra o dashboard do FaceVo no computador.
2. Vá em `Importar vídeo aprovado`.
3. Escolha o arquivo de vídeo local.
4. Opcionalmente envie uma imagem de thumbnail/screenshot.
5. Preencha título, descrição, categoria e notas.
6. Clique em `Enviar e analisar com IA`.
7. Publique somente vídeos aprovados e seguros.

## Configuração importante do servidor

Para o celular acessar o vídeo pelo Tailscale, o servidor precisa escutar em todas as interfaces:

```env
HOST=0.0.0.0
PUBLIC_BASE_URL=https://999cqg.tail0d77bf.ts.net:10000
```

Se o servidor estiver escutando apenas em `127.0.0.1`, o dashboard pode abrir no PC, mas o APK no celular não consegue baixar o vídeo. Nesse caso o app pode mostrar título/descrição do cache e o vídeo fica preto.

Para importar YouTube, o `yt-dlp` precisa estar instalado ou configurado:

```env
YTDLP_PATH=yt-dlp
YT_MAX_DURATION_SEC=180
YT_DOWNLOAD_TIMEOUT_MS=180000
YT_SEARCH_CANDIDATES=200
YT_SEARCH_TARGET=100
YT_SHORTS_MAX_DURATION_SEC=90
```

No Windows, se `yt-dlp` não estiver no PATH, coloque o caminho completo do `yt-dlp.exe` em `YTDLP_PATH`.

## Observação sobre direitos de uso

Use preferencialmente:

- vídeos próprios;
- vídeos feitos pela família;
- vídeos com permissão explícita;
- vídeos Creative Commons/domínio público quando aplicável;
- arquivos comprados/licenciados.

Evite baixar e redistribuir vídeos sem permissão.
