# Devify Labs — Client Acquisition & Audit Portal

A Next.js 14 Client Acquisition & Audit Portal for Devify Labs with automated daily local client discovery powered by OpenStreetMap Overpass API.

## Features
- **Live Client Opportunities:** Fetches 30 fresh real local business leads daily with **NO website tag** via OpenStreetMap Overpass API.
- **Dynamic Category Mix:** Automatically spans cafes, restaurants, bars, salons, real estate agencies, clinics, auto repair shops, gyms, bakeries, and boutiques.
- **Problem & Devify Pitch Engine:** Generates plain-language problem descriptions and tailored service pitches (Web app, booking portal, WhatsApp AI agent).
- **Daily Rotation & Storage Layer:** Automatically refreshes daily via Vercel Cron Job on `0 6 * * *` schedule, storing the day's 30 leads in `leads_cache.json`.
- **1-Click Export:** Download all leads to CSV/Excel for sales outreach.

---

## Environment Variables Configuration

Set the following Environment Variables in your **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable Name | Description | Default / Example Value |
| :--- | :--- | :--- |
| `TARGET_CITY_BBOX` | Bounding Box (`south,west,north,east`) for local business queries | `12.88,77.50,13.10,77.72` *(Bangalore)* |

### Example Bounding Box Coordinates:
- **Bangalore (Default):** `12.88,77.50,13.10,77.72`
- **Mumbai:** `18.90,72.75,19.25,72.98`
- **Delhi NCR:** `28.40,77.00,28.80,77.30`
- **London, UK:** `51.35,-0.30,51.65,0.15`
- **New York, US:** `40.60,-74.05,40.85,-73.85`

---

## Vercel Deployment Checklist
1. Push code to GitHub repository.
2. Import project into Vercel.
3. Add `TARGET_CITY_BBOX` in Environment Variables (optional, defaults to Bangalore).
4. Deploy! Vercel automatically sets up the daily 6:00 AM UTC Cron Job (`/api/cron/refresh-leads`).
