---
task: "Implementar Feed"
order: 1
input: |
  - dados: Contrato, estados e evidencias em output/dados.md
  - projeto_android: Activity, recursos e dependencias existentes em app/
  - modelos: Modelos de dominio e estados entregues pela camada de dados
output: |
  - implementacao: Feed vertical e coordenacao Media3 com recursos limitados
  - relatorio: Comportamento, testes e handoff em output/feed.md
---

# Implementar Feed

Criar o feed vertical do FaceVo e integrar Media3 sem permitir reproducao concorrente ou alocacao ilimitada. A tarefa deve renderizar degradacoes de forma simples e preparar a tela para a auditoria de acessibilidade.

## Process

1. Ler `output/dados.md` e verificar os modelos/estados reais; se o contrato nao estiver utilizavel, registrar bloqueio em vez de duplicar acesso HTTP na Activity.
2. Implementar a tela e recursos para `Loading`, `Content`, `Empty` e `Error`, incluindo retry e thumbnail persistente; tratar edge-to-edge e aplicar insets.
3. Configurar `RecyclerView` vertical com `PagerSnapHelper`; considerar ativo somente o item encaixado apos o scroll ficar ocioso.
4. Centralizar Media3 em coordenador com um player ativo e no maximo um segundo preparado; pausar o anterior antes de tocar o novo e nunca dar autoplay ao preload.
5. Manter thumbnail ate `EVENT_RENDERED_FIRST_FRAME`, exibir buffering sem esconder contexto e preservar retry em falha.
6. Pausar no `onStop`, retomar apenas o item elegivel e liberar players, listeners e surfaces no `onDestroy`; criar testes de troca rapida, background e destruicao.
7. Executar testes/build viaveis e escrever `output/feed.md` com limites observados, caminhos, resultados e pontos para Alice validar.

## Output Format

```yaml
status: "completed | blocked"
ui_states:
  rendered: ["Loading", "Content", "Empty", "Error"]
playback:
  active_rule: "regra do item ativo"
  maximum_players: 2
  preload: "comportamento"
lifecycle:
  on_stop: "acao"
  on_destroy: "acao"
changed_files:
  - "app/caminho/arquivo.kt"
tests:
  - command: "comando"
    result: "PASS | FAIL | BLOCKED"
accessibility_handoff:
  - "item a validar"
risks:
  - "risco residual"
```

## Output Example

> Use as quality reference, not as rigid template.

```yaml
status: "completed"
ui_states:
  rendered: ["Loading", "Content", "Empty", "Error"]
playback:
  active_rule: "pagina encaixada quando RecyclerView entra em SCROLL_STATE_IDLE"
  maximum_players: 2
  preload: "proximo item preparado sem playWhenReady"
lifecycle:
  on_stop: "pausar player ativo e registrar posicao"
  on_destroy: "remover listeners, desanexar PlayerView e liberar pool"
changed_files:
  - "app/src/main/java/br/com/facevo/ui/FeedActivity.kt"
  - "app/src/main/java/br/com/facevo/ui/FeedAdapter.kt"
  - "app/src/main/java/br/com/facevo/playback/PlaybackCoordinator.kt"
  - "app/src/androidTest/java/br/com/facevo/ui/FeedActivityTest.kt"
tests:
  - command: "./gradlew testDebugUnitTest"
    result: "PASS"
  - command: "./gradlew connectedDebugAndroidTest"
    result: "PASS"
accessibility_handoff:
  - "Medir botoes reproduzir, som, anterior, proximo e retry"
  - "Validar ordem de foco e anuncios de buffering/erro"
risks:
  - "Medir primeiro frame em aparelho fisico de entrada"
```

## Quality Criteria

- [ ] Somente o item ativo reproduz e no maximo dois players existem.
- [ ] Thumbnail permanece ate o primeiro frame e durante erro.
- [ ] `onStop` pausa; `onDestroy` libera listeners, surfaces e players.
- [ ] Estados do catalogo e retry estao visiveis e testaveis.
- [ ] Insets mantem controles alcancaveis no targetSdk 35.

## Veto Conditions

Reject and redo if ANY are true:

1. Existe um ExoPlayer por ViewHolder ou mais de dois players simultaneos.
2. Mais de um item pode reproduzir durante ou depois do scroll.
3. Player, PlayerView, listener ou surface permanece retido apos `onDestroy`.
4. Erro remove a thumbnail e nao oferece retry.
