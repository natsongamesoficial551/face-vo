# Research Brief: FaceVo Android

## Objetivo

Concluir o aplicativo Android FaceVo com um feed vertical simples, seguro e acessivel para idosos. A entrega deve integrar o catalogo publicado pelo servidor, reproduzir videos com Media3, preservar uma experiencia funcional sob falhas e produzir evidencias de build e testes.

## Contexto do Produto

- Empresa: NatanSites.
- Produto: FaceVo, plataforma de curadoria de videos curtos e seguros para idosos.
- Publico: idosos e seus familiares ou cuidadores.
- Tom: simples, acolhedor, seguro e direto.
- Curadoria: conservadora, com publicacao manual e rejeicao de golpes, violencia, sensualidade, alarmismo e manipulacao emocional.
- Estado atual informado: servidor e painel formam um MVP; o aplicativo Android esta incompleto.

## Escopo Tecnico

- Android em Kotlin com uma Activity e XML Views.
- Feed vertical com `RecyclerView` e `PagerSnapHelper`.
- Estado de tela em `ViewModel` e `StateFlow`.
- Cliente HTTP tipado, repositorio e cache local atomico.
- Contrato principal: `GET /api/catalog`, contendo apenas videos aprovados e publicados.
- Media3 ExoPlayer com um item ativo e no maximo dois players simultaneos.
- Pausa no `onStop` e liberacao deterministica no `onDestroy`.
- Testes unitarios para dados e estados; testes instrumentados para fluxos e acessibilidade.
- APK gerado quando SDK, JDK, rede e dependencias estiverem disponiveis.

## Conhecimento Consolidado

### Arquitetura Android

Separar transporte, dominio e UI. DTOs existem somente na fronteira HTTP; o repositorio valida e converte os itens em modelos de dominio; o ViewModel publica estados `Loading`, `Content`, `Empty` e `Error`; a Activity observa e renderiza. Trabalho assincrono deve ser cancelado com o ciclo de vida.

### Contrato e Resiliencia

O parser deve ignorar campos JSON desconhecidos para permitir evolucao compativel. Itens sem `id` ou sem `videoUrl` valida nao entram no feed. Timeout e erros HTTP devem virar mensagens acionaveis e nao detalhes tecnicos. Uma atualizacao invalida nunca substitui um cache valido; gravacao deve ser atomica.

### Playback

Somente o item encaixado pelo `PagerSnapHelper` pode tocar. O item seguinte pode ser preparado sem autoplay. Criar um player por ViewHolder ou preparar todo o catalogo amplia uso de codecs, memoria e rede. Thumbnail permanece ate o primeiro frame e em erros; retry deve estar disponivel.

### Acessibilidade

Controles interativos devem ter pelo menos 48dp, preferindo 56dp nos controles principais. Texto principal deve partir de 18sp e continuar utilizavel com fonte a 200%. Contraste minimo: 4.5:1 para texto normal e 3:1 para texto grande e componentes. Swipe nao pode ser a unica navegacao: botoes Anterior e Proximo sao obrigatorios. TalkBack precisa de rotulos orientados a acao e ordem de foco previsivel.

### Revisao

Toda aprovacao exige evidencia. A revisao pontua criterios de 1 a 10, justifica cada nota, separa mudancas obrigatorias de sugestoes e cita arquivo e linha para bloqueadores. `APPROVE` exige media minima 7/10 e nenhum criterio abaixo de 4/10. A terceira repeticao do mesmo problema deve ser escalada ao usuario.

## Fontes Disponiveis

1. `squads/facevo-android/_build/design.yaml` - design aprovado e fonte de verdade.
2. `squads/facevo-android/_build/discovery.yaml` - objetivo, audiencia, sistemas e modo de entrega.
3. `_opensquad/_memory/company.md` - contexto da NatanSites e riscos do FaceVo.
4. Android Developers - arquitetura, Media3/ExoPlayer e acessibilidade, conforme pesquisa consolidada no design.
5. WCAG 2.2 - contraste, operabilidade e alternativas de interacao, conforme pesquisa consolidada no design.
6. `_opensquad/core/best-practices/review.md` - metodologia de revisao e thresholds.

Nao existem investigacoes `raw-content.md` para este squad. Nenhuma pesquisa web adicional deve ser feita durante a execucao.
