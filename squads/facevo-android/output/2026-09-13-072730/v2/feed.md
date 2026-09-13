# Entrega de Felipe Feed

## Implementado

- Feed vertical em `MainActivity` com `RecyclerView`, `LinearLayoutManager` vertical e `PagerSnapHelper`.
- Adapter de videos com Glide para thumbnails, controles de play/pause, som e retry.
- Coordenador `FeedPlaybackCoordinator` com um unico `ExoPlayer`, portanto abaixo do limite de dois players.
- `PlaybackStateMachine` para item ativo, lifecycle, pausa e release.
- Renderizacao dos estados `Loading`, `Content`, `Empty` e `Error` do catalogo.
- Navegacao alternativa por botoes `Video anterior` e `Proximo video`.
- Edge-to-edge com insets aplicados nos controles.

## Verificacao

- Build no workspace original foi bloqueado pelo OneDrive ao tentar limpar `app/build/intermediates`.
- Build em copia temporaria fora do OneDrive avancou apos remover artefatos herdados, corrigiu duplicacao de `CatalogViewModelFactory`, e parou por crash nativo da JVM: `Gradle build daemon disappeared unexpectedly`.
- O log nativo registrou: `EXCEPTION_ACCESS_VIOLATION (0xc0000005)`.
- Nao houve novo erro Kotlin reportado depois da remocao do arquivo duplicado.

## Handoff

- Alice Acessibilidade deve revisar tamanhos, rotulos, ordem de foco, contraste, fonte ampliada e testes de navegacao sem swipe.
- Risco residual: repetir build/testes em ambiente Gradle/JDK estavel antes da aprovacao final.
