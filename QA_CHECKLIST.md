# QA Checklist

## Backend

- `npm run build` passes in `backend`.
- `npm test` passes in `backend`.
- `npm run test:integration` passes against an isolated PostgreSQL schema.
- `GET /health` returns `{"status":"ok"}`.
- Register user.
- Login user.
- `GET /auth/me` returns the authenticated user.
- Create dog while authenticated.
- Upload a dog image as an authenticated user.
- Confirm unauthenticated dog image upload returns `401`.
- Confirm new dog is pending moderation.
- Approve dog as admin.
- List dogs publicly and confirm approved dog appears.
- Create adoption request for approved available dog.
- List adoption requests as the requester.
- List adoption requests as the dog owner.
- Owner/admin updates adoption request status.
- Create donation campaign while authenticated.
- Approve campaign as admin.
- Create PIX donation with mock provider.
- Confirm logged-in PIX donation appears in `GET /donations/my`.
- Confirm mock webhook marks donation as paid and increments campaign amount.
- List partners publicly.

## Mobile

- App opens after onboarding state is reset.
- Onboarding can be skipped and persists.
- Login and register show clear validation errors.
- Dog registration route requires auth.
- Home lists approved backend dogs.
- Pull to refresh reloads dogs.
- Dog detail opens from Home.
- Adoption interest opens the responsible adoption form.
- Adoption form validates housing, routine, experience and responsibility confirmations.
- Adoption form creates a backend request.
- Perfil opens Solicitações de adoção and shows sent/received requests.
- Dog owner can approve/reject pending adoption requests in the app.
- Support campaign creation requires auth.
- Campaign card can generate PIX and copy the code.
- Perfil opens Minhas doações and shows PIX records generated while logged in.
- Partners opens from Perfil.
- Admin user sees Moderação in Perfil.
- Admin can approve/reject pending dogs and campaigns from the app.
- Theme switch persists.

## Visual

- Text does not overlap at mobile widths.
- Buttons are reachable and at least 44px tall.
- Empty states are visible for empty dogs, campaigns and partners.
- Light and dark themes remain readable.
