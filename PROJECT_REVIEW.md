# DoaDog Project Review

## Visao geral

O DoaDog ja passou de um prototipo simples: existe app Expo, backend Express/Prisma, moderacao, upload, pedidos de adocao, campanhas de apoio, PIX mock/Abacate Pay, documentos de loja e checklist de QA. A base tecnica esta boa para MVP, mas ainda faltam algumas pecas para virar produto confiavel em uso real.

## O que falta no aplicativo

1. Estados reais do ciclo do cao.
   O app fala em "em situacao de rua" e "lar temporario", mas o backend hoje so modela `AVAILABLE`, `UNDER_ANALYSIS` e `ADOPTED`. Isso faz parte da ideia se perder depois que os dados voltam da API.

2. Coordenadas e mapa funcional.
   A tela de mapa existe, mas o cadastro salva cidade/estado/endereco, nao latitude/longitude. Sem geocodificacao ou selecao no mapa, o mapa tende a ficar vazio.

3. Notificacoes.
   O produto depende de urgencia local, moderacao, interesse em adocao e status de doacao. Hoje isso precisa ser visto manualmente.

4. Fluxo de confianca para ONGs/protetores.
   Existe papel de ONG/protetor/parceiro, mas falta verificacao publica: selo, documentos revisados, historico, contatos validados e pagina de transparencia.

5. Jornada pos-adocao.
   O app registra interesse, mas ainda falta termo/checklist pos-aprovacao, combinacao de visita, status de entrega e acompanhamento depois da adocao.

6. Fotos e midia em producao.
   O upload valida melhor que a media dos MVPs, mas antes de escala publica ainda precisa de antivirus ou processamento gerenciado de imagens.

## Melhorias tecnicas prioritarias

1. Alinhar enum de status entre app, API e banco.
   Adicionar status como `STREET_SIGHTED`, `NEEDS_TEMPORARY_HOME`, `RESCUED`, `AVAILABLE`, `ADOPTED` ou simplificar a UI para os status que o backend realmente suporta.

2. Automatizar testes do app.
   Hoje ha typecheck no Expo e testes de contrato no backend. Falta pelo menos teste de servicos/mapeadores e um fluxo E2E basico.

3. CI com PostgreSQL.
   `test:integration` deve rodar sempre contra um schema isolado para pegar problemas de permissao, ownership e migracoes.

4. Observabilidade minima.
   Logs estruturados no backend, healthcheck com banco, erros de pagamento/webhook rastreaveis e metricas de criacao de campanhas/pedidos.

5. Experiencia offline/erro.
   O app ja trata alguns erros, mas fluxos de cadastro e doacao precisam de estados de retry e mensagens mais especificas quando API, upload ou PIX falham.

## Correcoes feitas nesta revisao

- Corrigida a tela de cadastro de cao para nao mostrar sucesso quando upload ou criacao no backend falham.
- Melhoradas mensagens de erro retornadas ao usuario no cadastro de cao.
- Corrigidos textos visiveis em areas de navegacao, campanhas, PIX e solicitacao de adocao.
- Restaurados operadores `??` quebrados durante a limpeza de texto e validado que o app compila.

## Proximo plano recomendado

1. Criar migracao de status de cao e atualizar mapeadores app/API.
2. Adicionar coordenadas no cadastro, com geocodificacao ou selecao no mapa.
3. Fechar fluxo de notificacoes para moderacao, interesse em adocao e doacoes.
4. Implementar verificacao de ONG/protetor e selo publico.
5. Rodar QA manual completo em um dispositivo Android com backend local ou staging.
