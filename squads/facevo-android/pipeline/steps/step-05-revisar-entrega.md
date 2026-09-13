---
execution: subagent
agent: revisao
inputFile: squads/facevo-android/output/experiencia.md
outputFile: squads/facevo-android/output/revisao.md
model_tier: powerful
on_reject: "2"
---

# Step 05: Revisar Entrega

## Context Loading

Load these files before executing:

- `squads/facevo-android/output/escopo.md` - fonte de verdade do run.
- `squads/facevo-android/output/dados.md` - implementacao e evidencias de dados.
- `squads/facevo-android/output/feed.md` - implementacao e evidencias de playback.
- `squads/facevo-android/output/experiencia.md` - matriz de acessibilidade.
- `squads/facevo-android/pipeline/data/research-brief.md` - contexto consolidado.
- `squads/facevo-android/pipeline/data/quality-criteria.md` - rubrica e veto global.
- `squads/facevo-android/pipeline/data/anti-patterns.md` - falhas conhecidas.
- `squads/facevo-android/pipeline/data/output-examples.md` - referencia de relatorio.
- `squads/facevo-android/agents/revisao/tasks/revisar-entrega.md` - metodologia completa.
- `squads/facevo-android/_memory/runs.md` - historico para contagem de revisoes.

## Instructions

### Process

1. Leia todos os artefatos e o diff Android inteiro antes de pontuar; confirme que nenhuma mudanca fora do escopo foi incluída.
2. Execute build e testes viaveis e audite contrato/cache, feed/player, lifecycle, insets, acessibilidade e seguranca com referencias de arquivo/linha.
3. Atribua nota justificada a cada area e calcule a media sem compensar qualquer nota abaixo de 4.
4. Em rejeicao, liste mudancas obrigatorias com local, impacto, correcao e verificacao; envie o fluxo ao passo 2.
5. Grave `output/revisao.md`; apos tres repeticoes do mesmo problema, escale em vez de iniciar novo ciclo automatico.

## Output Format

The output MUST follow this exact structure:

```markdown
# Revisao FaceVo Android

Veredito: APPROVE | CONDITIONAL APPROVE | REJECT | ESCALATE
Revisao: N de 3
Media: X.X/10

## Comandos Executados
| Comando | Resultado | Evidencia |
|---|---|---|

## Pontuacao
| Criterio | Nota | Justificativa |
|---|---:|---|

## Pontos Fortes
- evidencia especifica

## Mudancas Obrigatorias
1. `arquivo:linha` - problema, impacto, correcao e teste.

## Sugestoes Nao Bloqueadoras
- sugestao

## Riscos Residuais
- risco

## Caminho para Aprovacao
- acao objetiva ou "Entrega pronta para checkpoint final."
```

## Output Example

```markdown
# Revisao FaceVo Android

Veredito: REJECT
Revisao: 1 de 3
Media: 6.8/10

## Comandos Executados
| Comando | Resultado | Evidencia |
|---|---|---|
| `./gradlew testDebugUnitTest` | PASS | 18 testes, 0 falhas |
| `./gradlew assembleDebug` | PASS | APK debug gerado |

## Pontuacao
| Criterio | Nota | Justificativa |
|---|---:|---|
| Contrato e dados | 8/10 | Campos extras e cache possuem testes. |
| Feed e playback | 3/10 | `FeedAdapter.kt:84` cria player por ViewHolder. |
| Lifecycle e recursos | 6/10 | Pausa existe, mas pool nao e limitado. |
| Acessibilidade | 8/10 | Botoes e fonte ampliada passam. |
| Build e testes | 9/10 | Unitarios e assembleDebug passam. |

## Pontos Fortes
- `CatalogRepositoryTest` prova que resposta invalida preserva cache.

## Mudancas Obrigatorias
1. `app/src/main/java/br/com/facevo/ui/FeedAdapter.kt:84` - um player por ViewHolder pode esgotar codecs. Mover posse para coordenador com teto de dois e testar scroll por 20 itens.

## Sugestoes Nao Bloqueadoras
- Medir tempo ate primeiro frame em aparelho de entrada.

## Riscos Residuais
- TalkBack humano ainda nao executado.

## Caminho para Aprovacao
- Corrigir o pool e reexecutar teste de paginacao antes de retornar ao revisor.
```

## Veto Conditions

Reject and redo if ANY of these are true:

1. Veredito contradiz a media ou uma nota abaixo de 4.
2. Bloqueador nao possui arquivo/linha, impacto, correcao e verificacao.
3. Comando nao executado e declarado como sucesso.

## Quality Criteria

- [ ] Todos os criterios foram pontuados e justificados.
- [ ] Build/testes possuem evidencia ou bloqueio literal.
- [ ] Feedback obrigatorio e opcional esta separado.
- [ ] Revisao e riscos residuais estao registrados.
