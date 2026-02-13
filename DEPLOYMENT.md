# 🚀 Deployment Guide - Trading Journal Pro

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase project set up
- ✅ Database schema executed
- ✅ Storage bucket configured
- ✅ Environment variables ready
- ✅ GitHub account
- ✅ Vercel account (free)

---

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository

```bash
cd step-by-step

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Trading Journal Pro"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name: `trading-journal-pro`
4. Make it **Private** (or Public if you want)
5. **Do NOT** initialize with README
6. Click "Create repository"

### 1.3 Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/trading-journal-pro.git

# Push code
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Sign In

1. Go to https://vercel.com
2. Click "Sign Up" (or "Log In")
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 2.2 Import Project

1. From Vercel dashboard, click "Add New Project"
2. Click "Import" next to your `trading-journal-pro` repository
3. If you don't see it:
   - Click "Adjust GitHub App Permissions"
   - Grant access to the repository

### 2.3 Configure Project

**Framework Preset:** Next.js (auto-detected) ✅

**Build Settings:**
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

**Root Directory:** `./` ✅

### 2.4 Add Environment Variables

Click "Environment Variables" and add:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Your Supabase Project URL]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Your Supabase Anon Key]
```

**Where to find these:**
1. Go to your Supabase project
2. Click Settings → API
3. Copy "Project URL" and "anon public" key

### 2.5 Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. 🎉 Your app is live!

---

## Step 3: Configure Supabase for Production

### 3.1 Add Vercel URL to Allowed URLs

1. Go to Supabase Dashboard
2. Click Authentication → URL Configuration
3. Add your Vercel URL to "Site URL":
   ```
   https://your-project.vercel.app
   ```

4. Add to "Redirect URLs":
   ```
   https://your-project.vercel.app/**
   ```

### 3.2 Verify Storage Bucket

1. Go to Storage in Supabase
2. Ensure `trade-screenshots` bucket exists
3. Check it's set to **Public**
4. Verify policies are set (from schema.sql)

---

## Step 4: Test Your Deployment

### 4.1 Visit Your App

1. Go to `https://your-project.vercel.app`
2. You should see the login page
3. Try signing up with a new account
4. Verify everything works!

### 4.2 Test Checklist

- ✅ Login page loads
- ✅ Can create account
- ✅ Dashboard appears after login
- ✅ Can create trades
- ✅ Can upload screenshots
- ✅ Analytics display
- ✅ Settings work
- ✅ Sign out works

### 4.3 Common Issues

**"Unauthorized" errors:**
- Check environment variables in Vercel
- Verify Supabase URL is correct
- Make sure keys are saved

**Images not uploading:**
- Verify storage bucket exists
- Check bucket is public
- Verify storage policies

**Database errors:**
- Ensure schema was run
- Check RLS policies are enabled
- Verify user exists in profiles table

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to your Vercel project
2. Click "Settings" → "Domains"
3. Click "Add"
4. Enter your domain: `tradingjournal.com`
5. Click "Add"

### 5.2 Configure DNS

Vercel will show you DNS records to add:

**For root domain (tradingjournal.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Wait for DNS Propagation

- Usually takes 5-30 minutes
- Can take up to 48 hours
- Vercel will auto-provision SSL certificate

---

## Step 6: Continuous Deployment

### 6.1 How It Works

Once connected to GitHub:
- Push to `main` branch → Auto-deploys to production
- Push to other branches → Creates preview deployments
- Pull requests → Automatic preview URLs

### 6.2 Deploy Updates

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys to production
# 4. Usually takes 2-3 minutes
```

### 6.3 Rollback if Needed

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"
5. Instant rollback!

---

## Step 7: Monitoring & Analytics

### 7.1 Vercel Analytics

1. Go to your project in Vercel
2. Click "Analytics" tab
3. See:
   - Page views
   - Top pages
   - User locations
   - Performance metrics

### 7.2 Supabase Dashboard

1. Go to Supabase dashboard
2. Check:
   - **Database**: Monitor queries
   - **Storage**: Check file uploads
   - **Auth**: See user signups
   - **Logs**: View errors

### 7.3 Set Up Alerts

**Vercel:**
- Project Settings → Notifications
- Enable deployment notifications
- Get email on build failures

**Supabase:**
- Project Settings → Notifications
- Set up database alerts
- Monitor usage limits

---

## Step 8: Performance Optimization

### 8.1 Enable Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

In `app/layout.tsx`:
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 8.2 Optimize Images

Already configured in `next.config.js`:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
    },
  ],
}
```

### 8.3 Database Indexes

Already added in schema:
- ✅ User ID indexes
- ✅ Date indexes
- ✅ Symbol indexes
- ✅ Result indexes

---

## Step 9: Security Checklist

### 9.1 Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use Vercel environment variables
- ✅ Only expose `NEXT_PUBLIC_*` variables to client

### 9.2 Supabase Security

- ✅ Row Level Security (RLS) enabled
- ✅ Policies restrict data access
- ✅ Anon key is safe to expose (RLS protects data)
- ✅ Service role key NEVER in client code

### 9.3 HTTPS

- ✅ Vercel auto-provisions SSL
- ✅ All traffic encrypted
- ✅ Force HTTPS enabled

---

## Step 10: Scaling Considerations

### 10.1 Free Tier Limits

**Vercel Free:**
- 100 GB bandwidth/month
- Unlimited deployments
- 100 hours serverless execution

**Supabase Free:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

### 10.2 When to Upgrade

Upgrade when:
- Database > 400 MB
- Storage > 800 MB
- Consistent high traffic
- Need more than 2 projects

**Costs:**
- Vercel Pro: $20/month
- Supabase Pro: $25/month

---

## Troubleshooting

### Build Fails

**Error: Missing dependencies**
```bash
# Locally verify
npm install
npm run build

# If successful, push again
git push origin main
```

**Error: Environment variables**
- Check Vercel dashboard
- Ensure variables are set
- Redeploy after adding

### Runtime Errors

**"Failed to fetch" in production**
- Check browser console
- Verify API routes work
- Check Vercel function logs

**Database connection issues**
- Verify Supabase URL
- Check RLS policies
- Ensure schema was executed

**Upload failures**
- Verify storage bucket exists
- Check bucket is public
- Verify file size < 10MB

### Performance Issues

**Slow page loads**
- Check Vercel Analytics
- Monitor Supabase queries
- Optimize database indexes

**High bandwidth usage**
- Optimize images
- Enable caching
- Use Next.js Image component

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs in Vercel
- Monitor Supabase usage
- Review user feedback

**Monthly:**
- Update dependencies
- Review analytics
- Backup database (Supabase auto-backups)

**As Needed:**
- Deploy new features
- Fix bugs
- Optimize performance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Test locally
npm run dev

# Deploy if working
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

---

## Success! 🎉

Your Trading Journal Pro is now live and accessible worldwide!

**Your URLs:**
- Production: `https://your-project.vercel.app`
- Custom domain: `https://your-domain.com` (if configured)

**Next Steps:**
1. Share with friends/clients
2. Collect feedback
3. Add new features
4. Monitor usage
5. Enjoy your trading journal!

---

## Support Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Issues:** Create in your repository

---

**Congratulations on deploying your app! 🚀**
