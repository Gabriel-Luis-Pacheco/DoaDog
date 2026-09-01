# Security

## Current Controls

- Backend validates environment variables at boot.
- No real secrets are committed; examples use placeholders.
- Passwords use bcrypt with 12 salt rounds.
- Auth uses JWT bearer tokens.
- Mobile stores the JWT through the SecureStore-backed helper.
- Backend uses Helmet, CORS allow-listing, JSON body limits and rate limiting.
- Backend validates inputs with Zod.
- Prisma is used for database access.
- Public dog and campaign lists only expose approved/active content.
- Public donation status responses hide donor identity, provider IDs and PIX payloads.
- Admin moderation actions are recorded in `admin_actions`.
- Payment webhooks are idempotent through `payment_events`.
- Abacate Pay webhooks support HMAC validation through `X-Webhook-Signature` when a webhook secret is configured. Header secrets are supported as fallback; query-string secrets are local-development only.
- Dog image upload accepts only JPEG, PNG and WebP with a 5MB limit, validates magic bytes, strips common metadata chunks and uses random filenames.
- Backend contract tests cover critical validation schemas, upload validation, authorization middleware, webhook signature contracts and mock PIX generation.

## Known Risks To Finish

- Add malware scanning or an external media-processing pipeline before high-volume public launch.
- Run route-level integration tests with an isolated PostgreSQL test database in CI or a configured local database.
- Validate one real Abacate Pay payment/webhook in the provider sandbox or production test environment before opening public donations.
- Configure production CORS with explicit app/web origins.
- Do not use `npm audit fix --force` until Expo compatibility is reviewed.

## Audit Results

- Backend `npm audit --audit-level=moderate`: 0 vulnerabilities.
- Frontend `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `npm audit fix --force` is still not recommended unless an Expo SDK upgrade path is reviewed first.
