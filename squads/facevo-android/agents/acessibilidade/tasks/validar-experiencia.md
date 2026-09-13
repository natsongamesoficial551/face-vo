---
task: "Validar Experiencia"
order: 1
input: |
  - feed: Implementacao e evidencias em output/feed.md
  - projeto_android: Layouts, recursos, Activity e testes em app/
  - criterios: Metricas de acessibilidade em pipeline/data/quality-criteria.md
output: |
  - melhorias: Ajustes funcionais e de acessibilidade no aplicativo
  - matriz: Evidencias automaticas, inspecoes e testes humanos pendentes
  - relatorio: Resultado em output/experiencia.md
---

# Validar Experiencia

Auditar e aprimorar os fluxos criticos do FaceVo para pessoas idosas. A tarefa transforma requisitos de acessibilidade em medidas verificaveis e nao confunde automacao com validacao humana completa.

## Process

1. Ler `output/feed.md`, percorrer hierarquia, recursos e estados; mapear a ordem esperada: titulo, descricao, player, reproduzir/pausar, som, anterior e proximo.
2. Medir todos os alvos interativos; ajustar para minimo 48dp e preferir 56dp nos controles principais sem criar sobreposicao.
3. Verificar texto principal minimo de 18sp, layout com fonte a 200% e contraste de 4.5:1 para texto normal e 3:1 para texto grande/controles.
4. Garantir botoes Anterior e Proximo como alternativas completas ao swipe; adicionar rotulos orientados a acao, estados anunciaveis e ordem de foco previsivel.
5. Validar `Loading`, `Empty`, `Error`, retry, buffering, playback, mute, navegacao, background e retorno; criar testes instrumentados para comportamentos deterministicos.
6. Executar lint/testes viaveis e registrar separadamente `PASS automatizado`, `PASS por inspecao`, `PENDENTE humano` ou `BLOCKED`.
7. Escrever `output/experiencia.md` com matriz, caminhos alterados, resultados literais e riscos para revisao.

## Output Format

```yaml
status: "completed | blocked"
measurements:
  minimum_touch_target_dp: 48
  primary_text_sp: 18
  font_scale_tested: "200%"
  contrast: "resultado"
navigation:
  gesture_alternative: ["Anterior", "Proximo"]
  focus_order: "sequencia"
evidence:
  - criterion: "criterio"
    method: "automated | inspection | human"
    result: "PASS | FAIL | PENDING | BLOCKED"
changed_files:
  - "app/caminho/arquivo.xml"
risks:
  - "risco residual"
```

## Output Example

> Use as quality reference, not as rigid template.

```yaml
status: "completed"
measurements:
  minimum_touch_target_dp: 48
  primary_text_sp: 18
  font_scale_tested: "200% - acoes essenciais sem corte"
  contrast: "4.7:1 texto normal; 3.4:1 controles"
navigation:
  gesture_alternative: ["Anterior", "Proximo"]
  focus_order: "titulo, descricao, player, reproduzir/pausar, som, anterior, proximo"
evidence:
  - criterion: "Anterior e Proximo navegam sem swipe"
    method: "automated"
    result: "PASS"
  - criterion: "Rotulos anunciam acao e estado"
    method: "inspection"
    result: "PASS"
  - criterion: "Compreensao por pessoa idosa com TalkBack"
    method: "human"
    result: "PENDING"
changed_files:
  - "app/src/main/res/layout/activity_feed.xml"
  - "app/src/main/res/values/strings.xml"
  - "app/src/androidTest/java/br/com/facevo/ui/AccessibilityTest.kt"
risks:
  - "Executar sessao humana com TalkBack em aparelho fisico"
```

## Quality Criteria

- [ ] Alvos, tipografia e contraste possuem valores medidos.
- [ ] Fonte a 200% preserva leitura e acoes essenciais.
- [ ] Anterior e Proximo funcionam sem swipe.
- [ ] Rotulos e ordem de foco cobrem todos os controles principais.
- [ ] Evidencias distinguem automacao, inspecao e teste humano.

## Veto Conditions

Reject and redo if ANY are true:

1. Swipe permanece a unica navegacao entre videos.
2. Controle essencial mede menos de 48dp ou fica inacessivel com fonte a 200%.
3. Informacao ou estado e comunicado somente por cor.
4. O relatorio declara teste humano que nao foi realizado.
