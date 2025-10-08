# Deployment Guide for VectorStrat AI

## Step-by-Step Deployment Instructions

### Step 1: Push to GitHub

1. Create a new repository on GitHub (https://github.com/new)
   - Name it something like `vectorstrat-ai` or `vectorstrat-frontend`
   - Keep it public or private (your choice)
   - Don't initialize with README (we already have one)

2. In your terminal, run these commands from the project folder:
```bash
git init
git add .
git commit -m "Initial commit: VectorStrat AI landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign up or log in (recommend using GitHub account)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Vercel will automatically detect Next.js settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"
7. Wait 1-2 minutes for deployment to complete

### Step 3: Connect Your Porkbun Domain

#### In Vercel (after deployment):

1. Go to your project dashboard
2. Click on "Settings" → "Domains"
3. Add both domains:
   - `vectorstrat.ai`
   - `www.vectorstrat.ai`
4. Vercel will show you DNS configuration details

#### In Porkbun:

1. Log in to https://porkbun.com
2. Navigate to "Account" → "Domain Management"
3. Find `vectorstrat.ai` and click "DNS"
4. Add/update the following DNS records:

**For the apex domain (vectorstrat.ai):**
```
Type: A
Host: @
Answer: 76.76.21.21
TTL: 600
```

**For www subdomain:**
```
Type: CNAME
Host: www
Answer: cname.vercel-dns.com
TTL: 600
```

**Alternative: Use Vercel nameservers (recommended for easier management)**

Instead of A and CNAME records, you can point your entire domain to Vercel:

1. In Vercel domain settings, click "Use Vercel Nameservers"
2. Copy the nameserver addresses (usually ns1.vercel-dns.com and ns2.vercel-dns.com)
3. In Porkbun:
   - Go to "Authoritative Name Servers"
   - Change from "Porkbun DNS" to "Use Custom Name Servers"
   - Enter Vercel's nameservers
   - Save changes

### Step 4: Verify Domain Connection

1. DNS propagation takes 5 minutes to 48 hours (usually within 1 hour)
2. Check propagation status: https://dnschecker.org
3. In Vercel, click "Verify" next to your domains
4. Once verified, your site is live!

### Step 5: Set Up Automatic Deployments

Already configured! Every push to your `main` branch will:
- Automatically trigger a new build on Vercel
- Deploy to production
- Your site updates in 1-2 minutes

## Troubleshooting

### DNS Not Propagating
- Wait longer (up to 48 hours)
- Clear your browser cache
- Use incognito/private browsing
- Try from a different network

### Build Errors on Vercel
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Try running `npm run build` locally first

### SSL Certificate Issues
- Vercel automatically provides SSL
- Wait a few minutes after domain verification
- SSL certs are issued automatically

## Next Steps

1. Test your site at https://vectorstrat.ai
2. Add actual project content to `app/page.tsx`
3. Create separate project pages in the `app` directory
4. Add images to the `public` folder
5. Set up analytics (Vercel Analytics is free!)

## Updating Your Site

To make changes:
1. Edit your code locally
2. Test with `npm run dev`
3. Commit and push to GitHub:
```bash
git add .
git commit -m "Description of changes"
git push
```
4. Vercel automatically deploys your changes!
