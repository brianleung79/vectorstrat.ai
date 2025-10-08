# VectorStrat AI

A portfolio website showcasing AI projects and innovations.

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

### Initial Setup

1. Push this code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: VectorStrat AI landing page"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Connect to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

### Connecting Porkbun Domain

1. In Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Domains"
   - Add `www.vectorstrat.ai` and `vectorstrat.ai`
   - Vercel will provide DNS configuration details

2. In Porkbun Dashboard:
   - Log in to [porkbun.com](https://porkbun.com)
   - Go to your domain management for `vectorstrat.ai`
   - Navigate to DNS settings
   - Add the following records:

   **For apex domain (vectorstrat.ai):**
   - Type: A
   - Host: @
   - Answer: 76.76.21.21
   - TTL: 600

   **For www subdomain:**
   - Type: CNAME
   - Host: www
   - Answer: cname.vercel-dns.com
   - TTL: 600

3. Wait for DNS propagation (can take 24-48 hours, but usually faster)

4. Verify in Vercel:
   - Return to Vercel domains settings
   - Click "Verify" next to your domain
   - Once verified, your site will be live!

## Project Structure

```
vectorstrat/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main landing page
│   └── globals.css      # Global styles with dark theme
├── public/              # Static assets (add images/icons here)
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── next.config.js       # Next.js configuration
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Domain:** Porkbun

## Customization

- Update project cards in `app/page.tsx` as you add new AI projects
- Modify colors in `app/globals.css` and component styles
- Add project pages in separate folders under `app/`
- Store images in `public/` folder

## Future Enhancements

- Add individual project pages
- Implement blog/articles section
- Add animations and interactions
- Integrate analytics
- Add contact form with backend
