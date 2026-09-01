# DoaDog Figma Handoff

`FIGMA_LINK_TBD`

## Pages

- `Foundations`: import `design-tokens/tokens.json`.
- `Tokens`: color, spacing, radius, typography and elevation variables.
- `Components`: mirror code component names.
- `Patterns`: search + chips, photo-first dog card, support request card, sticky action bar.
- `Screens Light`: Home, Dog Detail, Register Dog, Help, Profile, Settings.
- `Screens Dark`: same instances with dark mode variables.
- `Prototype`: tab navigation and dog-detail CTA flow.
- `Handoff`: component-to-code mapping and QA notes.

## Code Mapping

- `BrandLogo` -> `src/components/BrandLogo.tsx`
- `Button` -> `src/components/AppButton.tsx`
- `SearchBar` -> `src/components/SearchInput.tsx`
- `DogCaseCard` -> `src/components/DogCard.tsx`
- `PhotoPickerField` -> `src/components/PhotoPickerCard.tsx`
- `SettingRow` -> `src/components/ProfileActionRow.tsx`
- `StickyActionBar` -> `src/components/StickyActionBar.tsx`

## Variant Rules

Use component variants for state, size, selected, loading, disabled, icon and tone. Use variables/modes for light and dark; do not duplicate separate light/dark components.

