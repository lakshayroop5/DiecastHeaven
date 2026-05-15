# Turso Database Setup for Vercel Deployment

## 1. Create Turso Account and Database

### Sign up
- Visit [https://turso.tech](https://turso.tech)
- Sign up with GitHub or email

### Create a database
```bash
# Install Turso CLI (requires Homebrew on macOS or download binary)
brew install tursodatabase/tap/turso

# Or on Windows with Chocolatey
choco install turso-cli
```

```bash
# Login to Turso
turso auth login

# Create a new database
turso db create your-app-name

# List your databases
turso db list
```

## 2. Get Connection URL

### Get the database URL
```bash
# Get the connection URL (for Prisma/Web)
turso db show your-app-name --url

# This returns something like:
# libsql://your-app-name.turso.io
```

### Get the auth token
```bash
# Generate a new token (save this - shown only once!)
turso db tokens create your-app-name

# Or list existing tokens
turso db tokens list your-app-name
```

## 3. Update .env for Production

### .env file format
```bash
# Production - Turso
DATABASE_URL="libsql://your-app-name.turso.io"
DATABASE_AUTH_TOKEN="your-auth-token-here"
```

### Vercel Environment Variables
In your Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| DATABASE_URL | `libsql://your-app-name.turso.io` | Production |
| DATABASE_AUTH_TOKEN | Your auth token | Production |

## 4. Prisma Configuration

The schema.prisma has been updated with `previewFeatures = ["driverAdapters"]` for Turso compatibility.

### Install dependencies
```bash
npm install @libsql/client
```

### Update DATABASE_URL format
Turso uses libsql protocol. For Prisma, you may need:

**Option A: URL-only (simpler)**
```
DATABASE_URL="libsql://your-app-name.turso.io"
```

**Option B: With auth token embedded**
```
DATABASE_URL="libsql://your-app-name.turso.io?authToken=your-auth-token"
```

## 5. Deploy to Vercel

```bash
# Push to GitHub first
git add .
git commit -m "Configure Turso database"
git remote add origin <your-repo-url>
git push -u origin main

# Then import project in Vercel dashboard or use Vercel CLI
npm i -g vercel
vercel
```

## Security Notes
- Never commit .env to git (already in .gitignore)
- Use a strong auth token (Turso generates secure ones)
- Rotate tokens periodically via `turso db tokens create`