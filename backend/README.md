# DoaDog Backend

Backend local inicial do DoaDog com Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Zod, Helmet, CORS configurável, rate limit e estrutura de pagamentos PIX.

Este projeto fica separado do app mobile React Native. Ele não usa Supabase, Firebase, MongoDB ou pagamento direto no frontend.

## Stack

- Node.js 20+
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- dotenv
- Helmet
- CORS configurável
- express-rate-limit

## Estrutura

```txt
src/
  app.ts
  server.ts
  config/
    env.ts
  lib/
    prisma.ts
    jwt.ts
    password.ts
  middlewares/
    auth.middleware.ts
    error.middleware.ts
    rateLimit.middleware.ts
  modules/
    auth/
    users/
    dogs/
    donationCampaigns/
    donations/
    adoptionRequests/
    partners/
    uploads/
    admin/
    payments/
    webhooks/
  utils/
```

## Instalação

```powershell
cd "C:\Users\pache\Downloads\doadog-mvp (1)\VIDECODEDOADOG\backend"
npm install
Copy-Item .env.example .env
```

Abra o arquivo `.env` e ajuste `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` e `WEBHOOK_SECRET`.

Nunca coloque chave real no código. Para AbacatePay, use apenas:

```env
PAYMENT_PROVIDER="abacatepay"
ABACATEPAY_API_KEY="sua-chave-dev-aqui"
```

## Opção A: PostgreSQL instalado no Windows

Depois de instalar o PostgreSQL, abra o terminal do PostgreSQL ou use `psql`:

```powershell
psql -U postgres
```

Dentro do `psql`:

```sql
CREATE USER doadog_user WITH PASSWORD 'doadog_password';
CREATE DATABASE doadog_db OWNER doadog_user;
GRANT ALL PRIVILEGES ON DATABASE doadog_db TO doadog_user;
\q
```

Confirme o `.env`:

```env
DATABASE_URL="postgresql://doadog_user:doadog_password@localhost:5432/doadog_db?schema=public"
```

Rode as migrations:

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
```

## Opção B: PostgreSQL com Docker

Suba o PostgreSQL local:

```powershell
docker compose up -d
```

Rode as migrations:

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
```

Para abrir o Prisma Studio:

```powershell
npm run prisma:studio
```

## Rodar o servidor

Desenvolvimento:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

Testes de contrato:

```powershell
npm test
```

Docker:

```powershell
docker build -t doadog-backend .
```

Produção local:

```powershell
npm run start
```

Health check:

```powershell
Invoke-RestMethod http://localhost:3333/health
```

## Fluxo completo de teste

### 1. Registrar usuário

```powershell
$register = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3333/auth/register `
  -ContentType "application/json" `
  -Body '{"name":"Ana DoaDog","email":"ana@example.com","password":"Senha12345"}'

$token = $register.token
$headers = @{ Authorization = "Bearer $token" }
```

### 2. Login

```powershell
$login = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3333/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"ana@example.com","password":"Senha12345"}'

$token = $login.token
$headers = @{ Authorization = "Bearer $token" }
```

### 3. Ver usuário autenticado

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri http://localhost:3333/auth/me `
  -Headers $headers
```

### 4. Criar cão

```powershell
$dog = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3333/dogs `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{
    "name":"Caramelo",
    "description":"Cão dócil encontrado perto da praça, precisa de adoção responsável.",
    "age":3,
    "size":"MEDIUM",
    "gender":"MALE",
    "city":"São Paulo",
    "state":"SP",
    "imageUrl":"https://example.com/caramelo.jpg",
    "status":"AVAILABLE"
  }'

$dogId = $dog.dog.id
```

### 5. Listar cães com paginação e filtros

```powershell
Invoke-RestMethod "http://localhost:3333/dogs?page=1&pageSize=10&state=SP&status=AVAILABLE"
```

### 6. Criar campanha

```powershell
$campaign = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3333/donation-campaigns `
  -Headers $headers `
  -ContentType "application/json" `
  -Body "{
    `"title`":`"Tratamento do Caramelo`",
    `"description`":`"Campanha para consulta, exames e medicamentos.`",
    `"goalAmountInCents`":50000,
    `"dogId`":`"$dogId`"
  }"

$campaignId = $campaign.campaign.id
```

### 7. Gerar PIX mock

Com `PAYMENT_PROVIDER="mock"` no `.env`:

```powershell
$pix = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3333/donations/campaigns/$campaignId/pix" `
  -ContentType "application/json" `
  -Body '{
    "amountInCents":1000,
    "donorName":"Doador Teste",
    "donorEmail":"doador@example.com"
  }'

$externalPaymentId = $pix.externalPaymentId
```

Resposta esperada:

```json
{
  "donationId": "...",
  "brCode": "...",
  "brCodeBase64": "...",
  "externalPaymentId": "mock_...",
  "expiresAt": "...",
  "status": "PENDING"
}
```

### 8. Confirmar pagamento via webhook mock

Se `WEBHOOK_SECRET` estiver configurado no `.env`, envie o header `x-webhook-secret`.

```powershell
$eventId = "evt_" + [guid]::NewGuid().ToString()

Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:3333/webhooks/mock/payment-confirmed `
  -Headers @{ "x-webhook-secret" = "change-me-webhook-secret" } `
  -ContentType "application/json" `
  -Body "{
    `"externalPaymentId`":`"$externalPaymentId`",
    `"eventId`":`"$eventId`"
  }"
```

O webhook é idempotente: repetir o mesmo `eventId` não soma o valor duas vezes.

### 9. Ver campanha atualizada

```powershell
Invoke-RestMethod "http://localhost:3333/donation-campaigns/$campaignId"
```

O campo `currentAmountInCents` deve aumentar em `1000`.

## AbacatePay

O frontend nunca deve chamar AbacatePay diretamente. Para ativar a estrutura:

```env
PAYMENT_PROVIDER="abacatepay"
ABACATEPAY_API_KEY="coloque-sua-chave-dev-no-env"
```

O backend falha na inicialização se `PAYMENT_PROVIDER=abacatepay` e `ABACATEPAY_API_KEY` estiver vazio.

Webhook preparado:

```txt
POST /webhooks/abacatepay
```

A rota valida `X-Webhook-Signature` como HMAC-SHA256 quando o header existe, registra o evento, evita duplicidade, tenta localizar a doação por `externalPaymentId`, confere valor pago quando recebido no payload e só soma campanhas dentro de transação. Antes de abrir doações públicas, valide um webhook real do provedor para confirmar nomes finais de evento/status.

## Segurança implementada

- `helmet`
- `cors` por `FRONTEND_URL`
- bloqueio de CORS `"*"` em produção
- `express-rate-limit`
- limite de JSON body em `100kb`
- validação de `.env`
- JWT com `JWT_SECRET`
- bcrypt com 12 salt rounds
- validação de entrada com Zod
- middleware global de erros
- stack trace oculto em produção
- `x-powered-by` desativado
- `passwordHash` nunca retornado
- mass assignment evitado com whitelists explícitas
- doações financeiras sem delete físico
- webhook idempotente
- validação HMAC opcional para webhook Abacate Pay
- upload de imagens com validação de assinatura de arquivo e remoção básica de metadados

## Scripts

```powershell
npm run dev
npm run build
npm run typecheck
npm run lint
npm run format
npm test
npm run start
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
```
