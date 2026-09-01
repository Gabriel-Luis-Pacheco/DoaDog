# DoaDog MVP

DoaDog is a React Native / Expo mobile app plus a Node.js / PostgreSQL backend for responsible dog adoption, moderation, partner visibility and PIX donations.

## Structure

- `DoaDog/`: Expo mobile app.
- `backend/`: Express API, Prisma schema, PostgreSQL migrations and payment adapters.
- `API.md`: REST endpoint summary.
- `DEPLOY.md`: VPS Hostinger deployment guide.
- `SECURITY.md`: security checklist and current risk notes.
- `QA_CHECKLIST.md`: manual MVP test pass.
- `STORE_CHECKLIST.md`: Android-first store preparation.
- `STORE_LISTING.md`: Play Store copy and data safety draft.
- `PRIVACY_POLICY.md` and `TERMS_OF_USE.md`: publication drafts.
- `docker-compose.prod.example.yml`: production Docker compose example.

## Local Commands

Backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run migrate
npm run seed
npm run test
# optional, requires a migrated PostgreSQL test schema:
# $env:RUN_INTEGRATION_TESTS='1'; npm run test:integration
npm run build
npm run lint
npm run dev
```

Mobile:

```powershell
cd DoaDog
npm install
Copy-Item .env.example .env
npm run typecheck
npm run lint
npm run start
```

Set `EXPO_PUBLIC_API_URL` in `DoaDog/.env` to the API URL reachable from the phone or emulator.

## GitHub and CI

The repository is organized as a monorepo and includes:

- `.github/workflows/ci.yml`: mobile typecheck, Expo validation/export, backend tests, integration tests and build.
- `.github/workflows/codeql.yml`: weekly and pull-request CodeQL analysis for JavaScript/TypeScript.
- `.github/dependabot.yml`: weekly npm dependency update checks for mobile/backend and monthly Docker checks.
- `.github/pull_request_template.md`: release-oriented pull request checklist.

Before pushing to GitHub, confirm that no local `.env`, credential, certificate or generated build is staged. The CI uses Node 20 and a PostgreSQL 16 service.

To connect this checkout to a GitHub repository after creating it, run from this directory:

```powershell
git remote add origin https://github.com/<OWNER>/<REPOSITORY>.git
git branch -M main
git push -u origin main
```

Do not commit secrets. Configure production values through GitHub Actions secrets or the deployment platform, never in tracked files.

## Current Status

Implemented foundations:

- Expo app with onboarding, auth context, protected dog registration route, backend API client, adoption request form/history, donation history, partner list, admin moderation surface and PIX donation modal.
- Express backend with JWT auth, user profiles, dogs, hardened dog image upload, adoption requests, donation campaigns, donations, signed/idempotent payment webhooks, partners and admin moderation.
- Prisma/PostgreSQL schema and migrations for the MVP domain.
- Abacate Pay provider boundary plus mock PIX provider for development.
- Backend contract tests for validation schemas, upload validation, authorization middleware, public donation privacy, webhook signatures, moderation contracts and mock PIX generation.
- Android-first EAS build configuration and draft privacy/terms/store listing documents.

Important remaining work:

- Malware scanning or managed media processing before high-volume public launch.
- Run `npm run test:integration` in CI/local PostgreSQL with valid credentials to continuously verify full ownership flows.
- Public privacy/terms URLs, final Play Store screenshots and one real Abacate Pay webhook validation.
