---
execution: inline
agent: feed
inputFile: squads/facevo-android/output/dados.md
outputFile: squads/facevo-android/output/feed.md
---

# Step 03: Implementar Feed

## Context Loading

Load these files before executing:

- `squads/facevo-android/output/dados.md` - contrato interno, estados e evidencias da camada de dados.
- `squads/facevo-android/output/escopo.md` - limites aprovados.
- `squads/facevo-android/pipeline/data/domain-framework.md` - metodologia de feed e playback.
- `squads/facevo-android/pipeline/data/quality-criteria.md` - limites de player, lifecycle e insets.
- `squads/facevo-android/pipeline/data/anti-patterns.md` - padroes proibidos de Media3.
- `squads/facevo-android/pipeline/data/tone-of-voice.md` - mensagens simples para estados e erros.
- `squads/facevo-android/_memory/memories.md` - aprendizados de runs anteriores.
- `squads/facevo-android/agents/feed/tasks/implementar-feed.md` - processo detalhado desta tarefa.

## Instructions

### Process

1. Confirme que o handoff de dados compila e fornece os quatro estados; nao crie uma segunda implementacao HTTP na tela.
2. Implemente estados e feed vertical com `RecyclerView`/`PagerSnapHelper`, aplicando insets e mantendo retry contextual.
3. Implemente coordenador Media3 com um item ativo, no maximo dois players e preload sem autoplay; mantenha thumbnail ate o primeiro frame.
4. Conecte pausa e liberacao ao lifecycle e cubra troca rapida, background, retorno, erro e destruicao com testes viaveis.
5. Registre em `output/feed.md` os limites observados, arquivos, comandos e pontos de auditoria de acessibilidade.

## Output Format

The output MUST follow this exact structure:

```markdown
# Feed e Playback

Status: COMPLETED | BLOCKED

## Experiencia Implementada
- Estados:
- Paginacao:
- Erro e retry:

## Coordenacao Media3
- Regra do item ativo:
- Maximo de players:
- Thumbnail/primeiro frame:
- Lifecycle:

## Arquivos Alterados
- `caminho`: descricao

## Testes e Build
| Comando | Resultado | Evidencia |
|---|---|---|

## Handoff de Acessibilidade
- controle ou estado a validar

## Riscos Residuais
- risco
```

## Output Example

```markdown
# Feed e Playback

Status: COMPLETED

## Experiencia Implementada
- Estados: loading, conteudo, vazio e erro renderizados sem bloquear a UI.
- Paginacao: vertical, uma pagina por encaixe apos scroll ocioso.
- Erro e retry: thumbnail e titulo permanecem; Tentar novamente reinicia somente o item.

## Coordenacao Media3
- Regra do item ativo: apenas a view encaixada recebe `playWhenReady=true`.
- Maximo de players: 2, confirmado por teste do coordenador.
- Thumbnail/primeiro frame: oculta somente em `EVENT_RENDERED_FIRST_FRAME`.
- Lifecycle: pausa no onStop e libera pool/listeners no onDestroy.

## Arquivos Alterados
- `app/src/main/java/br/com/facevo/ui/FeedActivity.kt`: estados e lifecycle.
- `app/src/main/java/br/com/facevo/playback/PlaybackCoordinator.kt`: pool limitado.
- `app/src/test/java/br/com/facevo/playback/PlaybackCoordinatorTest.kt`: transicoes.

## Testes e Build
| Comando | Resultado | Evidencia |
|---|---|---|
| `./gradlew testDebugUnitTest` | PASS | Pico observado de 2 players |

## Handoff de Acessibilidade
- Medir controles reproduzir, som, anterior, proximo e retry.
- Auditar anuncios de buffering e erro.

## Riscos Residuais
- Medir primeiro frame em aparelho fisico de entrada.
```

## Veto Conditions

Reject and redo if ANY of these are true:

1. Mais de um item toca ou mais de dois players podem existir.
2. Player, listener, Activity ou surface permanece retido apos destruicao.
3. Falha de video remove contexto visual ou nao oferece retry.

## Quality Criteria

- [ ] Item ativo e decidido apos encaixe e scroll ocioso.
- [ ] Pool, preload e lifecycle obedecem aos limites definidos.
- [ ] Thumbnail e estados degradados permanecem compreensiveis.
- [ ] Handoff lista controles e estados para auditoria acessivel.
