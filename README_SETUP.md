# Mitai Setup Guide

You have successfully scaffolded density the App! Here is what you need to do to make it fully functional.

## 1. Environment Variables
Rename `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

- **Supabase URL & Key**: Get these from your Supabase Project Settings > API.
- **OMDb API Key**: Get a free key from [omdbapi.com](https://www.omdbapi.com/apikey.aspx).

## 2. Database Schema
Go to your **Supabase SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
This will create:
- `profiles` table
- `watchlists` table
- `theatres` table
- Security Policies (RLS)

## 3. Email Auth
Enable **Email/Password** provider in Supabase Authentication.

## 4. Google Auth (Optional)
1. Create a Google Cloud Project and get OAuth Client ID/Secret.
2. Add them to Supabase Auth > Providers > Google.
3. Add `https://<YOUR_REF>.supabase.co/auth/v1/callback` to Google's Authorized Redirect URIs.

## 5. Run it!
```bash
npm run dev
```

Visit:
- `/` - Landing Page
- `/login` - Auth Page
- `/watchlist` - Dashboard (Protected)

## 6. Development with Docker

To run the app in a container (hot-reloading enabled):

```bash
docker-compose up -d
```

The app will be available at [http://localhost:3001](http://localhost:3001).
(Port 3001 is used to avoid conflicts with other local projects).

