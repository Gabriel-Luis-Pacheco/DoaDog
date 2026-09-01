# DoaDog API

Base URL: `http://localhost:3333` in local development.

Authentication uses `Authorization: Bearer <token>`.

## Health

- `GET /health`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

## Users

- `GET /users/profile`
- `PUT /users/profile`
- `PATCH /users/profile`

## Dogs

- `GET /dogs/list`
- `GET /dogs/detail/:id`
- `POST /dogs/create`
- `PUT /dogs/update/:id`
- `DELETE /dogs/delete/:id`
- `GET /dogs/my`

Dog creation starts with `moderationStatus=PENDING`; public list/detail only expose approved dogs.

## Uploads

- `POST /uploads/dog-images`

Authenticated multipart upload. Field name: `image`. Accepted types: JPEG, PNG and WebP. Max size: 5MB. The backend validates magic bytes, strips common metadata and returns a public URL.

## Adoption Requests

- `POST /adoption-requests/create`
- `GET /adoption-requests/list`
- `PATCH /adoption-requests/update-status/:id`

Admins can see all requests. Regular users see requests they created and requests for dogs they own.

## Donation Campaigns

- `GET /donation-campaigns/list`
- `GET /donation-campaigns/detail/:id`
- `POST /donation-campaigns/create`
- `PUT /donation-campaigns/update/:id`

User-created campaigns start pending. Active campaigns can receive PIX donations.
Public campaign list/detail expose only active campaigns. Campaigns support `urgencyLevel` (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`) for sorting/filtering and mobile badges.

## Donations

- `POST /donations/create-pix`
- `POST /donations/campaigns/:campaignId/pix`
- `GET /donations/my`
- `GET /donations/status/:id`
- `GET /donations/:id/status`

Payment confirmation must come from webhook processing, not from the mobile app.
Donation creation is public; if a valid bearer token is sent, the donation is linked to the authenticated user.
Public donation status endpoints return only non-sensitive payment status fields, not donor identity, external provider IDs or PIX copy/paste payloads.

## Partners

- `GET /partners/list`
- `GET /partners/detail/:id`
- `POST /partners/create` admin only
- `PUT /partners/update/:id` admin only
- `PATCH /partners/update/:id` admin only

## Admin

- `GET /admin/moderation`
- `PATCH /admin/moderation/dogs/:id`
- `PATCH /admin/moderation/donation-campaigns/:id`

## Webhooks

- `POST /webhooks/abacatepay`
- `POST /webhooks/mock/payment-confirmed`

Configure `ABACATEPAY_WEBHOOK_SECRET` or `WEBHOOK_SECRET`.

For Abacate Pay, the backend accepts `X-Webhook-Signature` as an HMAC-SHA256 signature over the raw JSON body. If no signature is sent, it falls back to a shared secret in `x-webhook-secret` or `x-doadog-webhook-secret`. Query-string secrets are accepted only outside production for local testing.
