# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- PostgreSQL database (Neon, Supabase, or Railway recommended)
- Clerk account for authentication
- EdgeStore account for file storage

### Environment Variables

Create these in your Vercel project settings:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# EdgeStore (optional, for file uploads)
EDGE_STORE_ACCESS_KEY="..."
EDGE_STORE_SECRET_KEY="..."
```

### Build Settings

**Framework Preset:** Next.js

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

**Node Version:** 18.x or higher

### Database Migration

After deployment, run migrations:

```bash
npx prisma migrate deploy
```

Or use Vercel's environment variables to run on build:

Add to `package.json`:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Post-Deployment Checklist

1. ✅ All environment variables set
2. ✅ Database connected and migrated
3. ✅ Clerk webhooks configured
4. ✅ EdgeStore bucket created
5. ✅ Custom domain configured (optional)
6. ✅ Analytics enabled (optional)

### Troubleshooting

**Build Fails:**
- Check all environment variables are set
- Verify DATABASE_URL is correct
- Ensure Prisma version is 5.x (not 7.x)

**Database Connection Issues:**
- Add `?schema=public` to DATABASE_URL
- Check IP whitelist settings
- Verify SSL settings for production

**Authentication Not Working:**
- Verify Clerk keys are correct
- Check authorized domains in Clerk dashboard
- Ensure middleware is configured properly

### Performance Optimization

- Enable Vercel Analytics
- Configure ISR for public pages
- Use Edge Functions where applicable
- Enable image optimization

### Monitoring

- Set up Sentry for error tracking
- Enable Vercel Speed Insights
- Monitor database performance
- Set up uptime monitoring
