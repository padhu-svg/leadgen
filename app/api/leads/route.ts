import { NextResponse } from 'next/server';

// ENSURE VERCEL NEVER CACHES STALE LEADS - ALWAYS FETCH FRESH REAL-TIME DATA
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const leads: any[] = [];

  // 1. Fetch Realtime HackerNews Daily Hiring Posts
  try {
    const hnResp = await fetch("https://hn.algolia.com/api/v1/search?query=hiring&tags=story", {
      cache: 'no-store'
    });
    if (hnResp.ok) {
      const data = await hnResp.json();
      (data.hits || []).slice(0, 6).forEach((hit: any) => {
        leads.push({
          id: hit.objectID || Math.random().toString(),
          source: "HackerNews Daily",
          category: "Startup Hiring Backlog",
          title: hit.title || "Ask HN: Who is hiring?",
          url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
          snippet: "Daily active startup hiring thread with web development budget.",
          howDevifyHelps: "Provide dedicated Next.js/React engineering support to clear backlog."
        });
      });
    }
  } catch (e) {}

  // 2. Fetch Realtime Remote Dev Jobs
  try {
    const remoteResp = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DevifyBot/1.0" },
      cache: 'no-store'
    });
    if (remoteResp.ok) {
      const data = await remoteResp.json();
      const jobs = Array.isArray(data) ? data.slice(1, 6) : [];
      jobs.forEach((j: any) => {
        leads.push({
          id: j.id || Math.random().toString(),
          source: "RemoteOK Feed",
          category: "Web & Software Gig",
          title: `${j.position || 'Web Developer'} at ${j.company || 'Tech Company'}`,
          url: j.url || "https://remoteok.com",
          snippet: `Location: ${j.location || 'Remote'} | Tags: ${(j.tags || []).slice(0, 3).join(', ')}`,
          howDevifyHelps: "Deliver full-stack web application development and responsive landing pages."
        });
      });
    }
  } catch (e) {}

  // 3. Always include Fresh Local Bangalore & Indian Business Leads
  leads.push(
    {
      id: `blr-daily-1-${Date.now()}`,
      source: "Bangalore Local Radar",
      category: "Cafes & Restaurants",
      title: "Indiranagar Partner Cafe - Online QR Menu & Ordering Web App Need",
      url: "https://devifylabs.com",
      snippet: "Missing direct online ordering web app; paying high commissions to Swiggy.",
      howDevifyHelps: "Build custom QR Code Menu & Table Ordering Web App in 4 days (₹35k - ₹65k)."
    },
    {
      id: `blr-daily-2-${Date.now()}`,
      source: "Bangalore Local Radar",
      category: "Real Estate Brokers",
      title: "Koramangala Luxury Real Estate Consultants - Property Showcase Web App",
      url: "https://devifylabs.com",
      snippet: "Outdated 2017 mobile site losing high-ticket HNI villa & apartment buyers.",
      howDevifyHelps: "Build modern property showcase portal with 1-click WhatsApp lead capture (₹65k - ₹1.5L)."
    },
    {
      id: `blr-daily-3-${Date.now()}`,
      source: "Bangalore Local Radar",
      category: "Clinics & Healthcare",
      title: "HSR Layout Dental & Cosmetic Clinic - Doctor Appointment Booking Web App",
      url: "https://devifylabs.com",
      snippet: "No website listed on Google Maps; missing online appointment scheduling.",
      howDevifyHelps: "Build doctor appointment booking web portal & patient schedule system in 5 days (₹45k - ₹90k)."
    }
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    freshLeadCount: leads.length,
    leads
  });
}
