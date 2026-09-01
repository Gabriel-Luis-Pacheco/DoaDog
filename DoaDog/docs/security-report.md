# DoaDog Security Report

## Scope

This pass did not add backend, payment, remote HTML rendering or new authentication infrastructure. The app remains local-first for the current MVP behavior.

## Current Mitigations

- User data is stored through the existing secure/local storage helpers.
- Donation/support contacts are stored separately through sensitive storage helpers.
- Form input is normalized through `src/utils/sanitize.ts`.
- Help flow copy explicitly says the app does not process payments.
- No WebView or arbitrary HTML rendering was introduced.

## Checks To Run

```bash
npm run typecheck
npx expo-doctor
npm audit --audit-level=high
npx expo export --platform android
```

## Latest Results

- `npm run typecheck`: passed.
- `npx expo-doctor`: passed, 18/18 checks.
- `npm audit --audit-level=high`: passed, 0 vulnerabilities.

## Residual Risks

- No automated test runner is installed yet.
- `expo-image` is not installed in this workspace, so current image rendering uses React Native `Image`.
- Bundle size can be improved later by exporting generated PNGs to WebP.
- If a real backend is added later, revisit auth, authorization, upload validation, rate limiting, EXIF removal and CSRF/XSS boundaries.
