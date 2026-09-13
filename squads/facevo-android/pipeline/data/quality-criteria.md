# Quality Criteria: FaceVo Android

## Rubrica

Cada area recebe nota de 1 a 10 com justificativa e evidencia. Aprovacao exige media geral maior ou igual a 7/10 e nenhuma area abaixo de 4/10. Falha de seguranca, perda de cache valido, vazamento de player ou navegacao dependente apenas de gesto e bloqueadora independentemente da media.

## Contrato e Dados

- [ ] `GET /api/catalog` e desserializado mesmo com campos desconhecidos.
- [ ] DTOs nao vazam para a UI.
- [ ] Itens sem `id` ou `videoUrl` valida sao filtrados deterministicamente.
- [ ] Timeout e erros HTTP viram estado de UI, sem stack trace para o usuario.
- [ ] Atualizacao falha ou invalida nao sobrescreve o cache anterior.
- [ ] Gravacao de cache evita estado parcial.
- [ ] Testes cobrem sucesso, filtragem, vazio, erro e cache.

## Feed e Playback

- [ ] O feed pagina verticalmente e identifica o item ativo apos estabilizacao.
- [ ] No maximo um video reproduz ao mesmo tempo.
- [ ] No maximo dois players existem simultaneamente.
- [ ] Thumbnail permanece ate o primeiro frame e em erro.
- [ ] Erro de playback oferece retry acionavel.
- [ ] Playback pausa em `onStop` e recursos sao liberados em `onDestroy`.
- [ ] Controles respeitam insets e edge-to-edge no targetSdk 35.

## Acessibilidade

- [ ] Alvos interativos medem pelo menos 48dp; controles principais preferem 56dp.
- [ ] Texto principal mede pelo menos 18sp e funciona com fonte a 200%.
- [ ] Contraste e no minimo 4.5:1 para texto normal e 3:1 para texto grande/controles.
- [ ] Anterior e Proximo fornecem alternativa ao swipe.
- [ ] Controles possuem rotulos acessiveis orientados a acao.
- [ ] Ordem de foco e previsivel e corresponde a leitura visual.
- [ ] Estado nao e comunicado somente por cor.
- [ ] Limites de testes automaticos e humanos sao distinguidos.

## Engenharia e Evidencia

- [ ] Mudancas respeitam a arquitetura e o escopo confirmado.
- [ ] Nenhuma operacao de rede ou player pesado roda na thread principal.
- [ ] Build e testes passam, ou o bloqueio ambiental e reproduzido literalmente.
- [ ] Todo bloqueador da revisao cita arquivo, linha, impacto e correcao.
- [ ] Sugestoes nao bloqueadoras estao separadas de mudancas obrigatorias.
- [ ] Risco residual e registrado.

## Escala de Pontuacao

- 9-10: completo, testado e com evidencia forte; apenas refinamentos opcionais.
- 7-8: atende ao criterio com pequenas lacunas nao bloqueadoras.
- 4-6: parcial; exige correcoes, embora possa permitir aprovacao condicional acima da media.
- 1-3: ausente, incorreto ou inseguro; rejeicao automatica.

## Veto Global

Rejeitar se houver autoplay de mais de um item, mais de dois players, cache valido destruido por resposta invalida, swipe como unica navegacao, recurso nao liberado, alegacao de teste sem comando/evidencia ou exposicao de erro tecnico ao publico.
