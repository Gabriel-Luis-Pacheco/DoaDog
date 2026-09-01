# DoaDog Design System

## Foundations

The DoaDog UI is light-first, token-driven and asset-led. The official logo remains at `assets/logo/logo-doadog.png`; illustrations live in `assets/illustrations`, and photo placeholders live in `assets/placeholders`.

## Theme

- `src/theme/colors.ts`: semantic light and dark themes.
- `src/theme/spacing.ts`: 4, 8, 12, 16, 24, 32, 48, 64.
- `src/theme/radius.ts`: xs, sm, md, lg, xl, pill.
- `src/theme/typography.ts`: compact native type scale.
- `src/theme/tokens/*`: import-friendly token bridges.
- `design-tokens/tokens.json`: Figma/tooling handoff.

## Component Map

- Primitives: `AppText`, `Button`, `IconButton`, `TextField`, `TextArea`, `SearchBar`, `Chip`, `Tag`, `Divider`, `Avatar`.
- Composites: `DogCard`, `FocusCard`, `PhotoPickerCard`, `HelpOptionCard`, `ProfileActionRow`, `PermissionCard`.
- Feedback: `EmptyState`, `ErrorState`, `SkeletonBlock`, `Toast`, `AppSnackbar`.
- Navigation and layout: `ScreenContainer`, `TopBar`, `BottomTabBar`, `StickyActionBar`, `WizardFooter`.

## Asset Policy

Do not draw dogs or complex scenes with `View`, circles, blobs or ad hoc JSX geometry. Use real PNG assets and remove weak visuals rather than improvising.

## Accessibility Guardrails

- Touch targets should be at least 48px high in practical UI.
- Text contrast should target WCAG AA.
- Important contacts should be selectable.
- Icons in buttons need labels through visible text or `accessibilityLabel`.

