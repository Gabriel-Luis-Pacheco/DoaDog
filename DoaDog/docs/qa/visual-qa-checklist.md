# DoaDog Visual QA Checklist

## Core

- App opens without runtime error.
- Light theme is the default.
- Dark theme uses deep green-grey surfaces, not pure black.
- Logo renders from `assets/logo/logo-doadog.png` and is not distorted.
- No dog, mascot or complex scene is drawn manually with `View`, circles or blobs.
- Screens use central theme tokens for colors, spacing, radius and typography.

## Navigation

- Bottom tab has four destinations: Início, Cadastrar, Ajuda, Perfil.
- Active tab is clear and inactive tabs remain readable.
- Tab bar does not hide forms, cards, sticky actions or list endings.
- Dog detail sticky action bar stays above the tab bar.

## Home

- Hero is short and uses a real asset.
- Search input is visible and has an icon.
- Filter chips scroll horizontally and do not wrap into noisy rows.
- Dog cards are photo-first and fully tappable.
- Empty state is simple, with asset, short copy and clear CTA.

## Register Dog

- Photo uploader is clean and supports up to five images.
- Save button does not cover fields.
- Keyboard does not trap the final fields behind navigation.
- Validation messages remain readable.

## Help

- The screen does not invent payment processing.
- Support requests make clear that contact must be confirmed directly.
- Help option cards have short copy and consistent icons.

## Profile / Settings

- Profile works for visitor and signed-in states.
- Settings opens from Perfil.
- Theme selection supports system, light and dark.
- Future features are marked as prepared/future, not pretending to be live backend.

## Accessibility

- Main touch targets are at least 48px high.
- Text contrast is AA-level by visual inspection and token review.
- Large text does not overlap buttons, cards or navigation.
- Important contact text is selectable where useful.
