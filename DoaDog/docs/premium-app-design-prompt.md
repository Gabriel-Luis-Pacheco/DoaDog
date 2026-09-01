# Prompt premium de design para o DoaDog

Use este prompt como direção de produto para próximas iterações do app DoaDog. Ele consolida o arquivo `Rebranding DoaDog Logo.docx`, referências de apps maduros e as regras visuais já aplicadas no código.

## Referências usadas

- Apple Human Interface Guidelines: navegação previsível, hierarquia clara, toque confortável e consistência entre telas. Referências: https://developer.apple.com/design/human-interface-guidelines/tab-bars e https://developer.apple.com/design/human-interface-guidelines/color
- Material Design 3: sistema de cor semântico, superfícies com profundidade discreta, estados interativos claros e tema escuro acessível. Referência: https://m3.material.io/styles/color/overview
- Airbnb mobile redesign: fluxo quebrado em perguntas menores, menos inputs simultâneos e foco no próximo passo do usuário. Referência: https://www.wired.com/2016/04/airbnbs-new-app-overhauls-user-experience/
- Petfinder e apps de adoção: busca, filtros, cards objetivos, perfil do animal com fotos reais e contato visível. Referência: https://www.petfinder.com
- Smashing Magazine sobre dark mode acessível: modo escuro como opção, sem preto puro, com contraste testado e cores menos saturadas. Referência: https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/

## Prompt mestre

Você é um principal product designer e design systems lead criando um app mobile de adoção e ajuda animal chamado DoaDog. O resultado precisa parecer um produto real, maduro, leve e confiável, como um app usado por milhares de pessoas, não uma tela improvisada por IA.

Use a logo oficial em `assets/logo/logo-doadog.png` como base da identidade. Não redesenhe a logo. Não crie cachorros, mascotes, cenas ou ilustrações complexas com shapes, círculos, blobs ou composição manual de `View`. Quando uma tela precisar de imagem, use assets reais: `assets/illustrations/home-hero.png`, `empty-state-dogs.png`, `register-dog.png`, `help.png` e `profile.png`. Se o asset não for bom, remova a ilustração e deixe a tela minimalista.

A direção principal é tema claro:

- Fundo principal: `#FFF7EC`
- Cards: `#FFFFFF` ou creme muito claro
- Texto principal: `#2B2B2B`
- Botão principal: `#F4A261`
- Navegação e destaque: `#2A9D8F`
- Coral `#E76F51` apenas para detalhes pequenos, urgência ou alertas

Mantenha um modo escuro secundário, elegante e acessível. Evite preto puro, grandes blocos escuros, sombras pesadas e cores saturadas. Use cinzas esverdeados profundos, texto off-white e destaques suaves.

Estruture a experiência em quatro tarefas principais: Início, Cadastrar cão, Ajuda e Perfil. Cada tela deve ter uma ação primária clara, texto curto, cards proporcionais e muito respiro. Use grid de 8px, botões com pelo menos 48dp de altura, labels legíveis, contraste mínimo de 4.5:1 em textos importantes e navegação inferior que nunca cubra campos, cards ou botões.

Na Home, mostre a marca com confiança, um hero simples e curto, busca com ícone, filtros horizontais, estatísticas pequenas e cards de cães escaneáveis. O estado vazio deve ser limpo, com mensagem curta e uma ação clara.

Na tela Cadastrar cão, trate o formulário como um fluxo guiado: foto, informações principais, localização, situação do cão e contato. O botão "Salvar cadastro" deve ficar dentro do fluxo e não cobrir campos. A área de foto deve ser limpa e usar ícone real de câmera ou asset, nunca desenho manual de cachorro.

Na Ajuda, use cards simples e informativos. Não invente pagamento, backend, carteira, checkout ou doação real se isso não existir. A tela deve orientar formas de ajudar e preparar a evolução futura.

No Perfil, use a logo real, uma apresentação simples e estados preparados para futura autenticação. Não simule autenticação real, planos pagos ou features inexistentes.

Critério de qualidade: se uma seção parece decorativa demais, remova. Se uma ilustração parece fraca, remova. Se uma cor aparece uma vez sem motivo, substitua por token do tema. Se um texto passa de duas linhas sem necessidade, encurte. O app deve parecer acolhedor, moderno, confiável e fácil de usar.
