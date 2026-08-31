import { NextResponse } from 'next/server';
import { fetchLeadsFromOverpass, getStoredLeads, saveStoredLeads, DailyLeadsResponse } from '@/lib/leadsStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const todayDate = new Date().toISOString().split('T')[0];
  const stored = getStoredLeads();

  // If today's 30 leads are already cached, return immediately
  if (stored && stored.date === todayDate && stored.leads && stored.leads.length > 0) {
    return NextResponse.json(stored);
  }

  // Otherwise, fetch 30 fresh leads from Overpass API
  try {
    const leads = await fetchLeadsFromOverpass();
    const nowIso = new Date().toISOString();
    const payload: DailyLeadsResponse = {
      date: todayDate,
      timestamp: nowIso,
      lastRefreshed: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
      count: leads.length,
      leads,
      error: null
    };

    saveStoredLeads(payload);
    return NextResponse.json(payload);
  } catch (err: any) {
    // If Overpass is unreachable, return stored fallback if available or structured error
    if (stored && stored.leads && stored.leads.length > 0) {
      return NextResponse.json({
        ...stored,
        error: `Couldn't refresh live leads — Overpass API unavailable (${err.message}). Showing cached leads.`
      });
    }

    return NextResponse.json({
      date: todayDate,
      timestamp: new Date().toISOString(),
      lastRefreshed: 'Unavailable',
      count: 0,
      leads: [],
      error: `Couldn't fetch live leads — Overpass API unavailable (${err.message}). Try refreshing.`
    }, { status: 503 });
  }
}

export async function POST() {
  const todayDate = new Date().toISOString().split('T')[0];
  try {
    const leads = await fetchLeadsFromOverpass();
    const nowIso = new Date().toISOString();
    const payload: DailyLeadsResponse = {
      date: todayDate,
      timestamp: nowIso,
      lastRefreshed: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
      count: leads.length,
      leads,
      error: null
    };

    saveStoredLeads(payload);
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({
      date: todayDate,
      timestamp: new Date().toISOString(),
      lastRefreshed: 'Unavailable',
      count: 0,
      leads: [],
      error: `Couldn't fetch live leads — Overpass API unavailable (${err.message}). Try refreshing.`
    }, { status: 503 });
  }
}
