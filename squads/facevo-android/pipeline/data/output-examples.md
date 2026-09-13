# Output Examples: FaceVo Android

## Exemplo 1: Entrega Aprovada

```markdown
# Resultado da Implementacao

## Escopo Executado
- Integracao de `GET /api/catalog` com DTO tolerante a campos desconhecidos.
- Repositorio com validacao de `id` e `videoUrl` HTTPS.
- Cache atomico preservado quando a atualizacao falha.
- Feed vertical com item ativo coordenado por `PagerSnapHelper`.
- Um player em reproducao e no maximo dois players alocados.
- Botoes Anterior e Proximo como alternativa ao swipe.

## Estados Verificados
- Loading: indicador anunciado e controles indisponiveis.
- Content: videos validos mantidos na ordem do catalogo.
- Empty: mensagem simples e acao Tentar novamente.
- Error: cache usado quando disponivel; retry sem detalhes HTTP.

## Evidencias
- `./gradlew testDebugUnitTest`: PASS.
- `./gradlew connectedDebugAndroidTest`: PASS em API 35.
- `./gradlew assembleDebug`: PASS.
- APK: `app/build/outputs/apk/debug/app-debug.apk`.

## Acessibilidade
- Alvos principais: 56dp.
- Texto principal: 18sp, validado com fonte a 200%.
- TalkBack: ordem titulo, descricao, player, reproduzir, som, anterior, proximo.

## Risco Residual
- Validar desempenho em aparelho fisico de entrada antes da distribuicao.
```

## Exemplo 2: Revisao Rejeitada

```markdown
# Revisao FaceVo Android

Veredito: REJECT
Revisao: 1 de 3
Media: 6.8/10

| Criterio | Nota | Evidencia |
|---|---:|---|
| Contrato e cache | 8/10 | Parser tolera campos extras e testes passam. |
| Playback | 3/10 | `FeedAdapter.kt:84` cria um player por ViewHolder. |
| Acessibilidade | 7/10 | Botoes alternativos existem; falta teste com fonte ampliada. |
| Build e testes | 9/10 | Unitarios e assembleDebug passam. |

## Pontos Fortes
- O repositorio nao expoe DTOs e preserva cache valido.
- A mensagem de erro nao apresenta codigo HTTP ao usuario.

## Mudancas Obrigatorias
1. `FeedAdapter.kt:84`: remover a criacao de ExoPlayer por ViewHolder. Impacto: o feed aloca codecs sem limite e pode falhar em aparelhos de entrada. Correcao: mover posse para um coordenador com pool maximo de dois players.
2. `FeedActivityTest.kt`: adicionar caso de fonte a 200% e provar que botoes continuam visiveis e acionaveis.

## Sugestoes Nao Bloqueadoras
- Registrar tempo ate o primeiro frame para futura analise de desempenho.

## Caminho para Aprovacao
- Corrigir o pool, executar os testes de troca de pagina e anexar o resultado.
- Adicionar e executar o teste de fonte ampliada.

Risco residual: TalkBack ainda requer validacao humana em aparelho fisico.
```

## Exemplo 3: Bloqueio Ambiental Honesto

```markdown
# Resultado de Verificacao

Status: BLOQUEADO PELO AMBIENTE

## Comandos
- `./gradlew testDebugUnitTest`: nao executado com sucesso.
- Erro literal: `SDK location not found. Define ANDROID_HOME or sdk.dir`.

## O que foi inspecionado
- Testes unitarios existem para sucesso, vazio, erro e cache.
- O codigo de lifecycle chama pausa no `onStop` e liberacao no `onDestroy`.
- Nenhum APK foi declarado como gerado.

## Requisito para Retomar
- Configurar Android SDK e `local.properties` sem versionar caminho local.
- Reexecutar testes e `assembleDebug`.

Risco residual: corretude de compilacao e comportamento instrumentado permanecem nao verificados.
```
