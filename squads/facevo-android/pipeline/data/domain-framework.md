# Domain Framework: FaceVo Android

## Principio Central

Entregar uma experiencia previsivel antes de otimizar sofisticacao. O app deve continuar compreensivel em carregamento, catalogo vazio, falha de rede, falha de video e retorno do segundo plano.

## Fase 1: Confirmar Escopo

1. Registrar objetivo da rodada, criterios incluidos e itens explicitamente fora de escopo.
2. Confirmar que alteracoes podem ocorrer somente em `app/` e configuracoes Android relacionadas durante a futura execucao do squad.
3. Registrar disponibilidade esperada de API, emulador/dispositivo, JDK, Android SDK e Gradle.
4. Exigir confirmacao humana antes de iniciar implementacao.

## Fase 2: Construir Camada de Dados

1. Inspecionar o contrato real de `GET /api/catalog` e configuracao Android existente.
2. Definir DTOs tolerantes a campos desconhecidos e modelos de dominio independentes.
3. Validar `id`, `videoUrl` e esquema seguro antes de expor itens.
4. Implementar cliente com timeout, repositorio e cache atomico que preserve a ultima resposta valida.
5. Expor `Loading`, `Content`, `Empty` e `Error` pelo ViewModel/StateFlow.
6. Cobrir sucesso, filtragem, vazio, erro e fallback de cache com testes.

## Fase 3: Construir Feed e Playback

1. Renderizar todos os estados sem bloquear a thread principal.
2. Montar feed vertical com `RecyclerView` e `PagerSnapHelper`.
3. Determinar o item ativo apenas quando o scroll estabilizar.
4. Coordenar um player ativo e, opcionalmente, um segundo player preparado.
5. Manter thumbnail ate o primeiro frame e durante falha; oferecer retry.
6. Pausar em `onStop`, retomar de forma previsivel e liberar em `onDestroy`.
7. Tratar edge-to-edge e insets para targetSdk 35.

## Fase 4: Validar Experiencia Acessivel

1. Auditar hierarquia semantica, rotulos e ordem de foco.
2. Medir alvos de toque, tipografia e contraste.
3. Adicionar Anterior e Proximo como alternativas ao swipe.
4. Testar fonte a 200%, TalkBack, loading, vazio, erro, retry e retorno do background.
5. Automatizar o que for deterministico e registrar testes humanos pendentes.

## Fase 5: Revisar Entrega

1. Ler escopo, artefatos das etapas e criterios de qualidade.
2. Inspecionar todo o diff sem modificar requisitos.
3. Executar build, testes unitarios e instrumentados viaveis; registrar saida literal em bloqueio ambiental.
4. Auditar contrato, cache, lifecycle, limite de players, insets e acessibilidade.
5. Pontuar cada criterio e emitir `APPROVE`, `CONDITIONAL APPROVE` ou `REJECT`.
6. Em `REJECT`, encaminhar correcoes ao passo 2; apos tres ciclos repetidos, escalar ao usuario.

## Regras de Decisao

- API indisponivel com cache valido: exibir conteudo em cache e registrar estado degradado.
- API indisponivel sem cache: exibir erro simples com retry.
- Catalogo valido sem itens: exibir estado vazio, nao erro.
- Item sem identificador ou URL valida: descartar item e preservar os demais.
- Item fora da tela: pausar imediatamente; liberar se estiver fora do pool limitado.
- Automacao de acessibilidade passa: ainda registrar necessidade de validacao humana com TalkBack quando nao executada.
- Build impossivel por ambiente: nao alegar sucesso; registrar comando, erro literal e requisito faltante.

## Definition of Done

A entrega esta pronta somente quando o catalogo possui estados testados, o feed limita recursos, o lifecycle e deterministico, os fluxos criticos sao acessiveis, o build/teste possui evidencia e o revisor atinge os thresholds sem bloqueador critico.
