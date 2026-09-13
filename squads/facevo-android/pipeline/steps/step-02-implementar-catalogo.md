---
execution: inline
agent: dados
inputFile: squads/facevo-android/output/escopo.md
outputFile: squads/facevo-android/output/dados.md
---

# Step 02: Implementar Catalogo

## Context Loading

Load these files before executing:

- `squads/facevo-android/output/escopo.md` - limites e decisoes confirmadas pelo usuario.
- `squads/facevo-android/pipeline/data/research-brief.md` - contexto tecnico e de produto consolidado.
- `squads/facevo-android/pipeline/data/domain-framework.md` - metodologia operacional da camada de dados.
- `squads/facevo-android/pipeline/data/quality-criteria.md` - criterios mensuraveis e vetos.
- `squads/facevo-android/pipeline/data/anti-patterns.md` - erros proibidos.
- `_opensquad/_memory/company.md` - publico, tom e riscos do FaceVo.
- `squads/facevo-android/_memory/memories.md` - aprendizados de runs anteriores.
- `squads/facevo-android/agents/dados/tasks/implementar-catalogo.md` - processo e schema desta tarefa.

## Instructions

### Process

1. Inspecione a configuracao Android e a implementacao real de `GET /api/catalog`; registre campos e divergencias antes de editar e nao modifique `server/`.
2. Implemente DTO, conversao para dominio, validacao de `id`/`videoUrl`, cliente com timeout, repositorio e cache atomico conforme o projeto realmente permite.
3. Exponha `Loading`, `Content`, `Empty` e `Error` com mensagens simples e retry; preserve cache valido em falha.
4. Crie testes deterministicos para sucesso, campos extras, filtragem, vazio, falha e fallback.
5. Execute os comandos viaveis e grave o handoff exato em `output/dados.md`; em bloqueio, inclua erro literal e nao fabrique `PASS`.

## Output Format

The output MUST follow this exact structure:

```markdown
# Camada de Dados

Status: COMPLETED | BLOCKED

## Contrato Confirmado
- Endpoint:
- Campos consumidos:
- Politica de URL:

## Implementacao
- DTO e dominio:
- Repositorio:
- Cache atomico:
- Estados de UI:

## Arquivos Alterados
- `caminho`: descricao

## Testes e Build
| Comando | Resultado | Evidencia |
|---|---|---|

## Handoff para Feed
- API interna consumivel:
- Regras de estado:

## Riscos Residuais
- risco ou "Nenhum identificado"
```

## Output Example

```markdown
# Camada de Dados

Status: COMPLETED

## Contrato Confirmado
- Endpoint: `GET /api/catalog`.
- Campos consumidos: `id`, `title`, `description`, `videoUrl`, `thumbnailUrl`.
- Politica de URL: HTTPS; HTTP apenas se ja autorizado pela configuracao de rede.

## Implementacao
- DTO e dominio: `CatalogVideoDto` e convertido para `CatalogVideo`; campos extras sao ignorados.
- Repositorio: filtra item sem id ou URL valida e preserva a ordem restante.
- Cache atomico: resposta validada vai a arquivo temporario antes do rename.
- Estados de UI: Loading, Content, Empty e Error com retry.

## Arquivos Alterados
- `app/src/main/java/br/com/facevo/data/CatalogApi.kt`: contrato HTTP tipado.
- `app/src/main/java/br/com/facevo/data/CatalogRepository.kt`: validacao e fallback.
- `app/src/test/java/br/com/facevo/data/CatalogRepositoryTest.kt`: sete cenarios.

## Testes e Build
| Comando | Resultado | Evidencia |
|---|---|---|
| `./gradlew testDebugUnitTest` | PASS | 7 testes, 0 falhas |

## Handoff para Feed
- API interna consumivel: observar `CatalogUiState` no ViewModel.
- Regras de estado: Empty e resposta valida sem itens; Error e falha sem cache.

## Riscos Residuais
- Validar latencia e certificado contra o host de producao.
```

## Veto Conditions

Reject and redo if ANY of these are true:

1. A UI recebe DTO, codigo HTTP ou item sem `id`/`videoUrl` valida.
2. Resposta invalida ou falha de escrita substitui cache valido.
3. O relatorio nao permite ao agente de feed localizar estados e modelos.

## Quality Criteria

- [ ] Campos desconhecidos sao tolerados e campos essenciais validados.
- [ ] Estados de UI e fallback possuem testes.
- [ ] Cache e escrito somente depois da validacao.
- [ ] Caminhos e resultados de comandos sao reais e explicitos.
