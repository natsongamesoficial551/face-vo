---
execution: inline
agent: acessibilidade
inputFile: squads/facevo-android/output/feed.md
outputFile: squads/facevo-android/output/experiencia.md
---

# Step 04: Validar Experiencia

## Context Loading

Load these files before executing:

- `squads/facevo-android/output/feed.md` - comportamento do feed e handoff de controles.
- `squads/facevo-android/output/dados.md` - estados que precisam ser anunciados.
- `squads/facevo-android/output/escopo.md` - requisitos aprovados.
- `squads/facevo-android/pipeline/data/quality-criteria.md` - medidas e thresholds.
- `squads/facevo-android/pipeline/data/domain-framework.md` - processo de auditoria.
- `squads/facevo-android/pipeline/data/anti-patterns.md` - barreiras proibidas.
- `squads/facevo-android/pipeline/data/tone-of-voice.md` - linguagem respeitosa e simples.
- `squads/facevo-android/agents/acessibilidade/tasks/validar-experiencia.md` - processo detalhado da tarefa.

## Instructions

### Process

1. Percorra todos os estados e construa uma matriz de controles, rotulos, ordem de foco e alternativa ao gesto antes de editar.
2. Meça e ajuste alvos para 48dp ou mais, texto principal para 18sp ou mais e contraste para os thresholds; valide fonte a 200%.
3. Garanta Anterior e Proximo, rotulos orientados a acao, estado nao dependente de cor e mensagens com retry.
4. Crie/execute testes instrumentados deterministicos e separe resultados automaticos, inspecao e validacao humana pendente.
5. Grave `output/experiencia.md` com valores, arquivos, comandos e riscos residuais sem declarar experiencia humana nao realizada.

## Output Format

The output MUST follow this exact structure:

```markdown
# Validacao de Experiencia

Status: COMPLETED | BLOCKED

## Medidas
| Criterio | Valor | Resultado |
|---|---:|---|

## Navegacao e Semantica
- Alternativa ao gesto:
- Ordem de foco:
- Rotulos e anuncios:

## Evidencias
| Criterio | Metodo | Resultado | Evidencia |
|---|---|---|---|

## Arquivos Alterados
- `caminho`: descricao

## Testes e Build
| Comando | Resultado | Evidencia |
|---|---|---|

## Riscos Residuais
- risco
```

## Output Example

```markdown
# Validacao de Experiencia

Status: COMPLETED

## Medidas
| Criterio | Valor | Resultado |
|---|---:|---|
| Menor alvo interativo | 48dp | PASS |
| Controles principais | 56dp | PASS |
| Texto principal | 18sp | PASS |
| Contraste de texto | 4.7:1 | PASS |

## Navegacao e Semantica
- Alternativa ao gesto: botoes Anterior e Proximo executam a mesma paginacao.
- Ordem de foco: titulo, descricao, player, reproduzir, som, anterior, proximo.
- Rotulos e anuncios: buffering, erro e estado do som sao anunciados.

## Evidencias
| Criterio | Metodo | Resultado | Evidencia |
|---|---|---|---|
| Fonte 200% | automatizado | PASS | Acoes essenciais visiveis |
| TalkBack em aparelho | humano | PENDING | Dispositivo nao disponibilizado |
| Navegacao sem swipe | automatizado | PASS | Teste avanca e retorna |

## Arquivos Alterados
- `app/src/main/res/layout/activity_feed.xml`: dimensoes e ordem.
- `app/src/main/res/values/strings.xml`: rotulos acessiveis.
- `app/src/androidTest/java/br/com/facevo/ui/AccessibilityTest.kt`: fluxos.

## Testes e Build
| Comando | Resultado | Evidencia |
|---|---|---|
| `./gradlew connectedDebugAndroidTest` | PASS | 5 testes, 0 falhas |

## Riscos Residuais
- Realizar sessao humana com TalkBack antes da distribuicao ampla.
```

## Veto Conditions

Reject and redo if ANY of these are true:

1. Swipe e a unica forma de navegar ou um alvo essencial mede menos de 48dp.
2. Fonte a 200% remove acao essencial, ou estado depende somente de cor.
3. Evidencia automatica e apresentada como teste humano.

## Quality Criteria

- [ ] Medidas incluem alvo, texto, escala e contraste.
- [ ] Ordem, rotulos, estados e alternativas estao documentados.
- [ ] Testes cobrem fluxos criticos sem gesto.
- [ ] Riscos humanos pendentes estao explicitos.
