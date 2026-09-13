---
task: "Implementar Catalogo"
order: 1
input: |
  - escopo: Escopo confirmado pelo usuario em output/escopo.md
  - projeto_android: Estrutura e configuracao existentes em app/
  - contrato_api: Implementacao real de GET /api/catalog no servidor, somente para inspecao
output: |
  - implementacao: Camada de dados, repositorio, cache e estados testaveis
  - relatorio: Evidencias e handoff em output/dados.md
---

# Implementar Catalogo

Implementar a fronteira de dados do FaceVo sem expor DTOs ou detalhes HTTP para a UI. A tarefa preserva a ultima resposta valida, torna estados explicitos e entrega ao feed uma lista segura e ordenada.

## Process

1. Ler o escopo confirmado, o build Android e a rota real `GET /api/catalog`; documentar campos, tipos, base URL, politica de transporte e qualquer divergencia antes de editar.
2. Definir DTOs tolerantes a campos desconhecidos e uma conversao explicita para dominio; rejeitar itens sem `id` nao vazio ou `videoUrl` valida conforme a politica de transporte do projeto.
3. Implementar cliente com timeout e cancelamento, repositorio que diferencie resposta vazia de falha e cache gravado atomicamente somente apos validacao completa.
4. Expor `Loading`, `Content`, `Empty` e `Error` via ViewModel/StateFlow, com mensagens simples e retry; usar cache valido como fallback quando apropriado.
5. Criar testes para sucesso, campos extras, filtragem parcial, vazio, erro sem cache, erro com cache e falha de persistencia; nao depender de rede real em teste unitario.
6. Executar os comandos viaveis de teste/build e escrever `output/dados.md` com arquivos alterados, contrato entregue, resultados literais e riscos.

## Output Format

```yaml
status: "completed | blocked"
contract:
  endpoint: "GET /api/catalog"
  domain_model: "nome do modelo"
  accepted_url_policy: "regra aplicada"
states:
  - "Loading"
  - "Content"
  - "Empty"
  - "Error"
cache:
  strategy: "atomica"
  fallback: "comportamento"
changed_files:
  - "app/caminho/arquivo.kt"
tests:
  - command: "comando"
    result: "PASS | FAIL | BLOCKED"
handoff: "contrato consumivel pelo feed"
risks:
  - "risco residual"
```

## Output Example

> Use as quality reference, not as rigid template.

```yaml
status: "completed"
contract:
  endpoint: "GET /api/catalog"
  domain_model: "CatalogVideo"
  accepted_url_policy: "HTTPS; HTTP apenas se ja autorizado por network security config"
states:
  - "Loading"
  - "Content(videos, source)"
  - "Empty"
  - "Error(message, canRetry)"
cache:
  strategy: "arquivo temporario validado e rename atomico"
  fallback: "emitir Content com cache valido quando a rede falhar"
changed_files:
  - "app/src/main/java/br/com/facevo/data/CatalogApi.kt"
  - "app/src/main/java/br/com/facevo/data/CatalogRepository.kt"
  - "app/src/main/java/br/com/facevo/ui/CatalogUiState.kt"
  - "app/src/test/java/br/com/facevo/data/CatalogRepositoryTest.kt"
tests:
  - command: "./gradlew testDebugUnitTest"
    result: "PASS"
handoff: "Felipe deve observar CatalogUiState e usar somente CatalogVideo; DTO e interno"
risks:
  - "Validar certificado e latencia contra o host de producao antes da distribuicao"
```

## Quality Criteria

- [ ] Parser aceita campos desconhecidos e filtra `id`/`videoUrl` invalidos.
- [ ] Cache valido nao e substituido por resposta ou escrita invalida.
- [ ] Quatro estados de UI possuem testes deterministas.
- [ ] Nenhum DTO ou erro HTTP aparece na API da UI.
- [ ] Relatorio lista caminhos e resultados reais de comandos.

## Veto Conditions

Reject and redo if ANY are true:

1. A Activity executa rede ou manipula diretamente DTO/cache.
2. Uma falha de rede ou parse sobrescreve o ultimo cache valido.
3. Itens sem identificador ou URL valida chegam ao feed.
4. O relatorio declara teste ou build sem registrar comando e resultado.
