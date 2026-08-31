# Deploying Devify Lead Portal to Vercel

This repository is 100% pre-configured and tested for Vercel deployment.

---

## Option 1: Vercel CLI (Fastest - 30 Seconds)

1. Open your terminal in this directory:
   ```bash
   cd C:\Users\pradh\.gemini\antigravity\scratch\devify-lead-portal
   ```
2. Run the Vercel deployment command:
   ```bash
   npx vercel
   ```
3. Follow the 3 prompts:
   - *Set up and deploy?* -> `y`
   - *Which scope?* -> Select your account
   - *Link to existing project?* -> `N`
   - *Project name?* -> `devify-lead-portal`
4. Once ready for live production, run:
   ```bash
   npx vercel --prod
   ```

---

## Option 2: Deploy via GitHub + Vercel Dashboard

1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Devify Labs Lead Portal"
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/devify-lead-portal.git
   git push -u origin main
   ```
2. Go to **[vercel.com/new](https://vercel.com/new)**.
3. Import your `devify-lead-portal` repository.
4. Click **Deploy**. Vercel will build and host your Web App instantly with a custom `.vercel.app` URL for your team!

---

## Features Included in Live Web App
- ⚡ **Instant Website & UX Auditor:** Input any domain -> gets Health Score (0-100), latency, tech stack, and 1-click copyable Cold Email & Loom scripts.
- 🎯 **Live Opportunity Scraper:** Scrapes real-time hiring leads from Reddit `r/forhire`, HackerNews, and Product Hunt.
- 📝 **Pitch Customizer:** Preset white-label agency and startup templates for your team.
