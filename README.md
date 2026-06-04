# PINNED — The NFT Social Map

## Setup

### 1. Environment Variables
Copy `.env.local.example` to `.env.local` for local dev.

Add these to Vercel → Settings → Environment Variables:
```
REACT_APP_SUPABASE_URL=https://dreqaqfqipnrjiqdutaf.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_ALCHEMY_KEY=LfW0EF1Fxqryrev5jTu4H
ALCHEMY_API_KEY=LfW0EF1Fxqryrev5jTu4H
SUPABASE_URL=https://dreqaqfqipnrjiqdutaf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_PASSWORD=your_strong_password_here
REACT_APP_ADMIN_PASSWORD=your_strong_password_here
```

### 2. Deploy
Push to GitHub → Import to Vercel → Add env vars → Deploy.

### 3. Admin Panel
Go to `/admin` and enter your ADMIN_PASSWORD to add collections.

## Pages
- `/` — Landing page
- `/map` — The interactive world map
- `/u/:username` — Public profile pages
- `/admin` — Collection management (password protected)
