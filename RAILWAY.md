# Railway deployment

This repository deploys as two Railway services:

- **LeadN web**: repository root, using the root `Dockerfile` and root
  `railway.toml`.
- **CallPilot API**: `callpilot/backend`, using its `Dockerfile` and
  `railway.toml`.

Both services should use the same GitHub repository. In Railway, create each
service from the repository and set its **Root Directory** to the directory
listed above. Railway provides `PORT`; do not hard-code it in service
variables.

## LeadN web variables

Set these in the web service:

```text
MONGODB_URI=<MongoDB connection string>
JWT_SECRET=<long random secret>
NEXT_PUBLIC_SITE_URL=https://<your-web-domain>
```

Optional analytics variables are documented in `.env.example`.

## CallPilot API variables

Set these in the API service:

```text
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/<database>
JWT_SECRET_KEY=<long random secret>
JWT_ALGORITHM=HS256
DEFAULT_AI_PROVIDER=gemini
GEMINI_API_KEY=<provider key>
ALLOWED_ORIGINS=https://<your-web-domain>
UPLOAD_DIR=/app/uploads
```

Add `OPENAI_API_KEY` instead of or alongside `GEMINI_API_KEY` when required.
Use the externally managed PostgreSQL/Supabase connection string; no Railway
database service is required for this setup.

## Deploy and verify

1. Deploy the web service and add its public domain to the API service's
   `ALLOWED_ORIGINS`.
2. Deploy the API service and verify `https://<api-domain>/health` returns
   `"status": "healthy"`.
3. Configure the Android release build with the API domain using
   `-PCALLPILOT_API_BASE_URL=https://<api-domain>/api/v1`.
4. Verify the web service at its Railway domain before adding custom domains.

Uploaded recordings use the container filesystem by default. Railway
containers are not durable storage, so configure object storage before relying
on production recording uploads.
