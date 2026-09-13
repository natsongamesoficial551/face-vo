# Tone of Voice: FaceVo Android

Este squad produz comunicacao tecnica e mensagens de interface, nao conteudo editorial. Seis tons padronizam a escolha conforme o momento.

## 1. Simples

Use em mensagens ao usuario. Frases curtas, uma acao por vez e nenhum detalhe HTTP.

Exemplo: "Nao foi possivel carregar os videos. Tente novamente."

## 2. Acolhedor

Use em estados vazios e recuperacao. Preserve autonomia e evite culpa.

Exemplo: "Ainda nao ha videos disponiveis. Voce pode tentar novamente daqui a pouco."

## 3. Seguro

Use ao explicar curadoria, transporte, cache e limites. Afirme apenas o que foi verificado.

Exemplo: "O app manteve o ultimo catalogo valido porque a nova resposta nao passou na validacao."

## 4. Direto

Use em relatorios de implementacao. Comece pelo comportamento observavel, depois cite mecanismo e evidencia.

Exemplo: "Somente o item ativo reproduz. O teste de troca de pagina passou com dois players alocados."

## 5. Tecnico

Use entre agentes e em artefatos de engenharia. Nomeie contrato, estado de UI, item ativo, lifecycle, timeout e cache atomico com precisao.

Exemplo: "O repositorio converte DTO em dominio antes de emitir `Content` pelo StateFlow."

## 6. Revisor

Use no gate final. Seja respeitoso, inequívoco e baseado em evidencia; separe bloqueadores de sugestoes.

Exemplo: "REJECT: `FeedAdapter.kt:84` cria um player por ViewHolder. Limite a posse a dois players e reexecute o teste de paginacao."

## Regras Comuns

- Prefira "pessoa idosa" ou "usuario" a generalizacoes paternalistas.
- Diga "nao verificado" quando o ambiente impedir o teste.
- Nao use "magica", "sempre funciona", "intuitivo para todos", "parece bom" ou "perfeito".
- Mensagens de UI devem dizer o que ocorreu em linguagem simples e oferecer proxima acao.
- Relatorios devem citar caminho, comando e resultado.
