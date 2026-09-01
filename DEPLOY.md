# Deploy VPS Hostinger

Target: Ubuntu VPS with Node.js, PostgreSQL, Nginx, HTTPS and PM2 or Docker.

## Server Setup

1. Create a deploy user.
2. Install Node.js 20+.
3. Install PostgreSQL 16+.
4. Create database and user:

```sql
CREATE USER doadog_user WITH PASSWORD 'replace-with-strong-password';
CREATE DATABASE doadog_db OWNER doadog_user;
GRANT ALL PRIVILEGES ON DATABASE doadog_db TO doadog_user;
```

5. Configure backend `.env` from `backend/.env.example`.
6. Run:

```bash
cd backend
npm ci
npm run prisma:generate
npm run migrate
npm test
npm run build
npm run start
```

Docker option:

```bash
cp docker-compose.prod.example.yml docker-compose.prod.yml
cp backend/.env.example backend/.env
# edit backend/.env and docker-compose.prod.yml secrets before running
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

## PM2 Option

```bash
npm install -g pm2
pm2 start dist/server.js --name doadog-api
pm2 save
pm2 startup
```

## Nginx

Proxy a public API subdomain to `http://127.0.0.1:3333`.

Set HTTPS with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.example.com
```

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Abacate Pay Webhook

Use:

```txt
https://api.example.com/webhooks/abacatepay
```

Set `ABACATEPAY_WEBHOOK_SECRET` in production. The backend validates `X-Webhook-Signature` as HMAC-SHA256 over the raw JSON body when the header is present, and falls back to a shared secret header/query value for development compatibility.

## Backups

Schedule daily `pg_dump` backups and keep at least 7 daily and 4 weekly copies off the VPS.
