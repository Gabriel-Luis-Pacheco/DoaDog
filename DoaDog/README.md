# DoaDog Mobile

Expo / React Native app for responsible dog adoption, support campaigns, partner visibility and PIX donation flows through the DoaDog backend.

## Setup

```bash
npm install
cp .env.example .env
npm run start
```

Configure:

```env
EXPO_PUBLIC_API_URL=http://localhost:3333
```

For a physical device, use an API URL reachable from the phone, such as the machine LAN IP or a public tunnel.

## Implemented

- Onboarding with local persistence.
- Light/dark/system theme.
- JWT session storage through SecureStore-backed helpers.
- Backend API client using `fetch`.
- Protected dog registration route.
- Home feed backed by `/dogs/list`.
- Dog registration posts to `/dogs/create`.
- Dog photo picker uploads images to `/uploads/dog-images` before dog creation.
- Adoption interest opens a responsible adoption form and posts to `/adoption-requests/create`.
- Profile includes adoption request history from `/adoption-requests/list`.
- Support campaigns post to `/donation-campaigns/create`.
- Campaign card creates PIX charges through `/donations/create-pix`.
- Profile includes donation history from `/donations/my` for donations generated while logged in.
- Partners screen lists `/partners/list`.
- Admin users can approve/reject pending dogs and campaigns from the Profile moderation screen.
- Favorites and UI preferences remain local-only.

## Commands

```bash
npm run start
npm run android
npm run ios
npm run web
npm run typecheck
npm run lint
npm run format
npm run doctor
npx eas-cli@latest build -p android --profile production
```

## Notes

- Do not put secrets in `EXPO_PUBLIC_` variables.
- The app no longer uses Supabase or Firebase.
- Upload validates MIME, file signatures and common metadata stripping on the backend; add malware scanning before high-volume public launch.
