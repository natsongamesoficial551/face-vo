# Anti-Patterns: FaceVo Android

## Dados

1. Rede na Activity: mistura transporte e apresentacao, impede teste isolado e ignora lifecycle.
2. DTO direto na UI: acopla telas ao contrato externo e espalha nulabilidade.
3. Aceitar item sem `id` ou URL valida: transfere erro previsivel para o player.
4. Sobrescrever cache antes da validacao: remove a ultima experiencia funcional.
5. Exibir codigo HTTP, `null` ou stack trace: comunica detalhe interno ao publico.
6. Declarar que aceita "qualquer JSON": confunde tolerancia a campos extras com ausencia de validacao.

## Playback

1. Um ExoPlayer por ViewHolder: esgota memoria, codecs e surfaces.
2. Preparar todos os videos: desperdiça rede e causa travamentos.
3. PlayerView singleton: retem Activity e surface.
4. Autoplay fora do item ativo: gera audio concorrente e comportamento imprevisivel.
5. Reproduzir em segundo plano sem requisito: surpreende o usuario e consome recursos.
6. Remover thumbnail antes do primeiro frame: produz tela preta durante buffering.

## Acessibilidade

1. Swipe como unica navegacao: exclui pessoas com dificuldade motora.
2. Estado apenas por cor: falha para baixa visao e leitores de tela.
3. Desabilitar escala de fonte: remove uma preferencia essencial do sistema.
4. Alvos visuais sem area minima: aumenta toques acidentais.
5. Rotulos como "botao 1": nao informam finalidade.
6. Controles que somem rapidamente: penalizam usuarios que precisam de mais tempo.
7. Chamar idosos de incapazes: e paternalista e nao descreve requisito testavel.

## Revisao

1. Aprovar sem executar comandos: nao fornece evidencia.
2. Usar "parece bom": substitui criterio por impressao.
3. Dar nota sem justificativa: impede auditoria.
4. Ignorar criterio abaixo de 4 pela media: mascara bloqueador.
5. Rejeitar sem arquivo, linha e correcao: cria retrabalho por adivinhacao.
6. Alterar requisito durante revisao: cria alvo movel.
7. Alegar APK gerado quando o build falhou: invalida toda a entrega.

## Praticas Corretivas

- Validar antes de persistir e escrever cache atomicamente.
- Centralizar a posse dos players em coordenador com limite explicito.
- Projetar alternativas a gestos desde o inicio.
- Medir dimensoes e contraste, em vez de qualificar como "grande" ou "legivel".
- Registrar comando, resultado e limitacao de ambiente.
- Separar mudanca obrigatoria, sugestao e risco residual.
