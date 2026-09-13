---
task: "Revisar Entrega"
order: 1
input: |
  - escopo: Decisoes aprovadas em output/escopo.md
  - entregas: Relatorios dados.md, feed.md e experiencia.md
  - codigo: Diff completo da implementacao Android
  - criterios: Rubrica e referencias em pipeline/data/
output: |
  - veredito: APPROVE, CONDITIONAL APPROVE ou REJECT
  - revisao: Notas, evidencias, correcoes e risco residual em output/revisao.md
---

# Revisar Entrega

Auditar a entrega FaceVo Android sem substituir criterios por preferencia. A tarefa deve produzir um veredito matematicamente coerente, reproduzivel e acionavel para o checkpoint final ou para um novo ciclo.

## Process

1. Ler escopo, tres handoffs, memoria e todas as referencias; identificar numero da revisao e nao pontuar antes de concluir essa leitura.
2. Inspecionar o diff completo e citar arquivo/linha para achados sobre contrato, cache, arquitetura, lifecycle, players, insets, acessibilidade e seguranca.
3. Executar build, testes unitarios e instrumentados viaveis; registrar comando e resultado literal, sem transformar bloqueio ambiental em `PASS`.
4. Pontuar individualmente contrato/dados, feed/playback, lifecycle/recursos, acessibilidade e build/testes de 1 a 10, cada nota com justificativa.
5. Calcular media: `REJECT` abaixo de 7 ou com qualquer nota abaixo de 4; `CONDITIONAL APPROVE` para media >= 7 com lacunas nao criticas entre 4 e 6; caso contrario `APPROVE`.
6. Separar pontos fortes, mudancas obrigatorias e sugestoes; para cada bloqueador informar local, impacto, correcao e teste de confirmacao.
7. Se o mesmo problema completar tres rejeicoes, emitir `ESCALATE` ao usuario; salvar o relatorio em `output/revisao.md`.

## Output Format

```yaml
verdict: "APPROVE | CONDITIONAL APPROVE | REJECT | ESCALATE"
revision: "N of 3"
overall_score: 0.0
scores:
  - criterion: "nome"
    score: 0
    evidence: "justificativa com referencia"
commands:
  - command: "comando"
    result: "PASS | FAIL | BLOCKED e saida relevante"
strengths:
  - "ponto forte verificavel"
required_changes:
  - location: "arquivo:linha"
    impact: "impacto"
    fix: "correcao"
    verification: "teste"
suggestions:
  - "sugestao nao bloqueadora"
residual_risks:
  - "risco"
```

## Output Example

> Use as quality reference, not as rigid template.

```yaml
verdict: "REJECT"
revision: "1 of 3"
overall_score: 6.8
scores:
  - criterion: "Contrato e dados"
    score: 8
    evidence: "CatalogRepositoryTest cobre campos extras e preservacao de cache"
  - criterion: "Feed e playback"
    score: 3
    evidence: "app/src/main/java/br/com/facevo/ui/FeedAdapter.kt:84 cria player por ViewHolder"
  - criterion: "Lifecycle e recursos"
    score: 6
    evidence: "onStop pausa, mas o adapter ainda possui players"
  - criterion: "Acessibilidade"
    score: 8
    evidence: "Anterior/Proximo e fonte a 200% possuem testes"
  - criterion: "Build e testes"
    score: 9
    evidence: "testDebugUnitTest e assembleDebug passaram"
commands:
  - command: "./gradlew testDebugUnitTest"
    result: "PASS"
strengths:
  - "Cache valido permanece intacto em resposta invalida"
required_changes:
  - location: "app/src/main/java/br/com/facevo/ui/FeedAdapter.kt:84"
    impact: "Pode esgotar codecs e memoria em aparelhos de entrada"
    fix: "Mover a posse para coordenador com no maximo dois players"
    verification: "Teste de scroll por 20 itens confirma pico <= 2"
suggestions:
  - "Medir tempo ate o primeiro frame em aparelho fisico"
residual_risks:
  - "Sessao humana com TalkBack ainda pendente"
```

## Quality Criteria

- [ ] Todos os criterios possuem nota e justificativa especifica.
- [ ] Media e hard triggers correspondem ao veredito.
- [ ] Todo bloqueador inclui local, impacto, correcao e verificacao.
- [ ] Comandos e resultados sao literais e reproduziveis.
- [ ] Revisao, pontos fortes, sugestoes e riscos estao registrados.

## Veto Conditions

Reject and redo if ANY are true:

1. O veredito nao corresponde as notas ou ignora criterio abaixo de 4.
2. Existe bloqueador sem arquivo/linha, impacto e correcao acionavel.
3. Build ou teste e declarado aprovado sem comando e resultado.
4. A revisao omite um dos criterios definidos ou altera o escopo.
