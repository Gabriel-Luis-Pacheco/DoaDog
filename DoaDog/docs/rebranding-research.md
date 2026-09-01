# Pesquisa De Rebranding E Refatoração Do DoaDog

## Direção Visual

O DoaDog deve seguir Illustrated UI Design: ilustrações planas, personagens simples, elementos botânicos, formas orgânicas e uma paleta acolhedora. A referência principal é transformar a interface em uma pet-tech social, profissional e emocionalmente confiável, sem parecer infantil ou gerada por IA.

Referências:

- Dribbble, "24 examples of creative illustration use in mobile design": https://dribbble.com/stories/2020/07/10/illustration-in-mobile-design
- Material Design, Onboarding: https://m2.material.io/design/communication/onboarding.html
- Material Design, Empty states: https://m1.material.io/patterns/empty-states.html
- Duolingo Shape Language: https://blog.duolingo.com/shape-language-duolingos-art-style/
- Duolingo Design Identity: https://design.duolingo.com/identity
- Apple Developer, Headspace Behind the Design: https://developer.apple.com/news/?id=fkfnhq8u

Aplicação no app:

- Usar ilustrações apenas em onboarding, estados vazios e áreas de foco.
- Manter ilustrações abaixo de 40% da área visível.
- Evitar emojis em botões, cards, títulos e formulários.
- Priorizar poucos CTAs por tela e microcopy curta.
- Misturar navy, off-white, azul, coral, verde botânico e lilás em tokens centralizados.

## Guidelines Apple E Samsung

Referências:

- Apple Human Interface Guidelines, Foundations: https://developer.apple.com/design/human-interface-guidelines/foundations
- Apple Human Interface Guidelines, Color: https://developer.apple.com/design/human-interface-guidelines/color
- Apple Human Interface Guidelines, Dark Mode: https://developer.apple.com/design/human-interface-guidelines/dark-mode
- Apple Reduced Motion Evaluation Criteria: https://developer.apple.com/help/app-store-connect/manage-app-accessibility/reduced-motion-evaluation-criteria/
- Samsung One UI: https://design.samsung.com/global/contents/one-ui/
- Samsung One UI Grid: https://developer.samsung.com/one-ui/layout/grid.html

Aplicação no app:

- Separar área de visualização e área de interação, mantendo ações principais próximas da parte inferior.
- Tema Claro/Escuro/Sistema deve ficar visível em Perfil e persistir localmente.
- Animações devem ser curtas, funcionais e nunca competir com o conteúdo.
- Texto precisa ter contraste suficiente em claro e escuro.
- Cards devem funcionar como focus blocks: poucos dados, boa hierarquia e ação clara.

## Código Limpo, Expo E Segurança

Referências:

- Expo UI Guidelines, Expo Go primeiro: https://docs.expo.dev/get-started/set-up-your-environment/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo Environment Variables: https://docs.expo.dev/guides/environment-variables/
- Expo FAQ, limitações do Expo Go: https://docs.expo.dev/faq/
- React Native Security: https://reactnative.dev/docs/security
- React Native Appearance: https://reactnative.dev/docs/appearance
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP Mobile Top 10 2024: https://owasp.org/www-project-mobile-top-10/2023-risks/
- OWASP MASTG Network Communication: https://mas.owasp.org/MASTG/0x04f-Testing-Network-Communication/
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase MFA: https://supabase.com/docs/guides/auth/auth-mfa
- Android R8 shrinking and obfuscation: https://developer.android.com/build/shrink-code

Aplicação no app:

- Manter `AsyncStorage` para dados não sensíveis e `SecureStore` para perfil/contatos quando disponível.
- Não guardar secrets em `EXPO_PUBLIC_`.
- Validar e sanitizar entradas antes de salvar.
- Manter certificate pinning, MFA, RLS e obfuscação como requisitos de produção/EAS, não como dependências obrigatórias do Expo Go.
- Preservar componentes reutilizáveis e tokens centralizados antes de criar estilos locais.

## Skills Codex Úteis

- `doadog-mobile-ui-polish`: skill local do projeto com regras de UI, tema, doações e Expo Go.
- `security-threat-model`: útil para mapear ativos, fronteiras de confiança, abuso e mitigação antes da produção.
- `security-best-practices`: revisão de código JavaScript/TypeScript com foco em práticas seguras.
- `figma-implement-design`: útil se houver arquivo Figma para transformar em código com fidelidade.
- `create-plan`: útil para decompor mudanças grandes antes de executar.
- `frontend-skill` e `frontend-design`: citadas em catálogos externos, mas não estavam instaladas como skills ativas neste ambiente.

