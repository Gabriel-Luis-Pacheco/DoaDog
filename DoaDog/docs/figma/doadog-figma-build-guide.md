# DoaDog Figma Build Guide

## Pages

1. Cover
   - Use `assets/logo/logo-doadog.png`.
   - Add product statement: app de adoção responsável, cuidado e apoio comunitário.

2. Foundations
   - Import `docs/figma/doadog.tokens.json`.
   - Create color variables with two modes: Light and Dark.
   - Create spacing, radius, typography and shadow styles from the token file.

3. Components
   - Build components matching code props:
     - `BrandLogo`: size, showWordmark.
     - `AppHeader`: title, subtitle, leftAction, rightActions.
     - `PrimaryButton`: loading, disabled, icon, fullWidth.
     - `SearchInput`: value, placeholder, clear state.
     - `FilterChip`: selected, icon, count.
     - `StatusBadge`: tone, icon.
     - `DogCard`: image, status, tags, favorite, pressed.
     - `PhotoUploader`: empty, filled, error.
     - `SettingRow`: leftIcon, rightSlot.
     - `StickyActionBar`: primary, secondary.

4. Flows Light
   - Home: header, hero, stats, search, chips, dog feed, empty state.
   - Dog Detail: photo, identity card, sections, sticky action bar.
   - Register Dog: hero, uploader, grouped form sections, save action.
   - Help: hero, help option grid, support request cards.
   - Profile: identity card, actions, theme/settings.

5. Flows Dark
   - Duplicate frames only as instances using dark mode variables.
   - Do not duplicate component definitions for dark mode.

6. QA
   - Place contrast notes, safe-area screenshots, empty states and large-text checks.

## Asset Rules

- Never draw the dog with Figma primitive-only placeholder shapes.
- Use exported PNG assets from `assets/illustrations`.
- For missing dog photos, use `assets/placeholders/dog-photo-01.png` or `dog-photo-02.png`.
- Keep illustrations supportive; remove them if they compete with content.

## Naming

- Component names should mirror code names.
- Variant props should mirror component props where possible.
- Use semantic tokens, not raw hex names.
