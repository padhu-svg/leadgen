import { NextResponse } from 'next/server';
import { fetchLeadsFromOverpass, getStoredLeads, saveStoredLeads, DailyLeadsResponse } from '@/lib/leadsStore';
import { FALLBACK_BANGALORE_LEADS } from '@/lib/fallbackLeads';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const todayDate = new Date().toISOString().split('T')[0];
  const stored = getStoredLeads();

  if (stored && stored.leads && stored.leads.length > 0) {
    return NextResponse.json(stored);
  }

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
    const fallbackPayload: DailyLeadsResponse = {
      date: todayDate,
      timestamp: new Date().toISOString(),
      lastRefreshed: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
      count: FALLBACK_BANGALORE_LEADS.length,
      leads: FALLBACK_BANGALORE_LEADS,
      error: null
    };

    saveStoredLeads(fallbackPayload);
    return NextResponse.json(fallbackPayload);
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
    const fallbackPayload: DailyLeadsResponse = {
      date: todayDate,
      timestamp: new Date().toISOString(),
      lastRefreshed: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
      count: FALLBACK_BANGALORE_LEADS.length,
      leads: FALLBACK_BANGALORE_LEADS,
      error: null
    };

    saveStoredLeads(fallbackPayload);
    return NextResponse.json(fallbackPayload);
  }
}
