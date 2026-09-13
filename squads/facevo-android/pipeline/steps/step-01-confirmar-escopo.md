---
type: checkpoint
outputFile: squads/facevo-android/output/escopo.md
---

# Step 01: Confirmar Escopo

Apresente ao usuario o escopo proposto antes de qualquer alteracao no aplicativo. Salve a resposta no arquivo de output deste run.

## Apresentar

- Objetivo: concluir o Android FaceVo com catalogo, feed vertical, Media3, acessibilidade, testes e APK quando o ambiente permitir.
- Limites: modificar apenas o projeto Android durante a execucao; o servidor pode ser lido para confirmar o contrato, mas nao alterado sem novo consentimento.
- Criterios criticos: cache preservado, um video ativo, no maximo dois players, lifecycle deterministico, alternativa ao swipe e evidencia de testes.
- Dependencias: API, JDK, Android SDK, Gradle e emulador/dispositivo podem limitar verificacoes.

## Pergunta ao Usuario

Confirme o escopo ou descreva ajustes objetivos. Inclua, se souber, base URL da API, variante de build desejada e disponibilidade de emulador/dispositivo.

## Condicao para Prosseguir

Somente prossiga quando houver confirmacao explicita. Se houver ajuste, registre-o integralmente em `escopo.md` para que todos os agentes usem a mesma fonte.
