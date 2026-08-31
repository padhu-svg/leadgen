import { NextResponse } from 'next/server';
import { fetchLeadsFromOverpass, saveStoredLeads, DailyLeadsResponse } from '@/lib/leadsStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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
    return NextResponse.json({
      success: true,
      message: `Daily cron refreshed ${leads.length} leads from Overpass API.`,
      payload
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: `Cron refresh failed — Overpass API error: ${err.message}`
    }, { status: 500 });
  }
}
