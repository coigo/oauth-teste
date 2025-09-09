POC: oidc-provider + Prisma + PostgreSQL + Redis cache + Protected API + Next.js client

Includes:
- Authorization Code + PKCE
- Authorization Code (confidential) + Refresh Token
- Client Credentials
- Redis caching for clients (Prisma primary store)
- Prisma Adapter to persist sessions/tokens in Postgres
- docker-compose to run Postgres + Redis

Quick start (example):
1) Copy .env.example to oidc-server/.env and set DATABASE_URL (or use docker-compose, default matches it)
2) Start docker infra:
   docker-compose up -d
3) Install and prepare db:
   cd oidc-server
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
4) Client:
   cd client
   npm install
   npm run dev

Notes:
- This is a development POC. Change secrets, cookie keys, and JWKS for production.
"# oauth-teste" 
