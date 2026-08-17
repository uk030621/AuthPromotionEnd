# Pay-By Ledger

A device-responsive Next.js app for tracking credit card promotional-rate
end dates, backed by MongoDB, with Google sign-in via NextAuth. Each card
shows a live countdown to its promo end date, color-coded by urgency, and
is private to the signed-in Google account that created it.

Dates display throughout in UK format (dd/mm/yyyy).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment example:
   ```bash
   cp .env.local.example .env.local
   ```

3. **MongoDB** — add your connection string to `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=paydate_tracker
   ```
   Works with MongoDB Atlas (free tier) or a local instance
   (`mongodb://localhost:27017`). The `cards` collection is created
   automatically on first insert.

4. **NextAuth secret** — generate one and add it to `.env.local`:
   ```bash
   openssl rand -base64 32
   ```
   ```
   NEXTAUTH_SECRET=<paste the generated value>
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Google OAuth credentials**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/) →
     APIs & Services → Credentials.
   - Create an **OAuth 2.0 Client ID** of type "Web application".
   - Add an authorized redirect URI:
     `http://localhost:3000/api/auth/callback/google`
     (add your production URL's equivalent when you deploy, e.g.
     `https://yourdomain.com/api/auth/callback/google`).
   - Copy the generated Client ID and Client Secret into `.env.local`:
     ```
     GOOGLE_CLIENT_ID=...
     GOOGLE_CLIENT_SECRET=...
     ```

6. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and sign in with Google.

## Project structure

```
app/
  page.js                       Dashboard (client component, session-gated)
  layout.js                     Root layout, fonts, wraps app in AuthProvider
  api/auth/[...nextauth]/route.js  NextAuth handler (Google provider)
  api/cards/route.js            GET (list own cards) / POST (create)
  api/cards/[id]/route.js       PATCH / DELETE (own cards only)
components/
  AuthProvider.js                Client wrapper for NextAuth's SessionProvider
  AuthButton.js                  Sign in / sign out button
  CardForm.js                    Add-card form (UK date picker)
  CardTile.js                    Single card row with countdown
  CountdownBadge.js              Stamped "days left" badge
lib/
  auth.js                        NextAuth config (Google provider, JWT sessions)
  mongodb.js                     Connection singleton
  dueDate.js                     Countdown/date math, UK dd/mm/yyyy formatting
```

## Auth & data ownership

- Sessions use JWTs (no database adapter needed for NextAuth itself).
- Every card is stored with the owner's `userEmail`. The `/api/cards`
  routes require a signed-in session and only ever read, update, or
  delete cards belonging to that session's email — so one account can
  never see or modify another's cards, even by guessing an id.
- Signing out clears the session but leaves your cards in MongoDB for
  next time you sign in.

## Async route params (Next.js 15+)

Dynamic Route Handler segments (like the `[id]` in `api/cards/[id]/route.js`)
have `params` as an async value in Next.js 15+, so it's awaited before
destructuring: `const { id } = await params;`. This is safe on Next 14 too,
since awaiting a plain object just resolves it immediately. The NextAuth
catch-all route (`[...nextauth]`) doesn't need this itself, since we never
destructure `params` there directly — it's passed straight into
`NextAuth(authOptions)`, which handles it internally.

## Notes

- The countdown recalculates automatically at local midnight without a page
  refresh, and re-derives from the stored `dueDate` on every render.
- Layout is mobile-first throughout, including the sign-in/sign-out header.

## Deploying

Any Next.js host works (Vercel, Render, etc.). Set `MONGODB_URI`,
`MONGODB_DB`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your production URL), and
the Google OAuth vars as environment variables in your host's dashboard —
and add the production callback URL to your Google OAuth client. Don't
commit `.env.local`.
