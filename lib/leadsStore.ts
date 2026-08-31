import fs from 'fs';
import path from 'path';
import { RawOSMElement, EnrichedLead, DailyLeadsResponse } from './types';
import { processAndSortRawElements } from './leadProcessor';
import { FALLBACK_HIGH_TICKET_LEADS } from './fallbackLeads';

const CACHE_FILE = process.env.VERCEL ? '/tmp/leads_cache.json' : path.join(process.cwd(), 'leads_cache.json');
const DEFAULT_BBOX = process.env.TARGET_CITY_BBOX || "12.88,77.50,13.10,77.72"; // Bangalore Bounding Box

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter"
];

declare global {
  var _leadsCache: DailyLeadsResponse | null;
}

// Optimized, Timeout-Safe High-Ticket Overpass QL Query
export function buildHighTicketOverpassQuery(bbox: string = DEFAULT_BBOX): string {
  return `[out:json][timeout:12];
(
  node["amenity"~"clinic|dentist|doctors|veterinary|events_venue"](${bbox});
  node["office"~"accountant|lawyer|architect|consulting|estate_agent|financial"](${bbox});
  node["tourism"~"hotel|guest_house"](${bbox});
  node["leisure"~"resort|fitness_centre"](${bbox});
  node["shop"~"car_repair|motorcycle_repair|optician|interior_decorator"](${bbox});
);
out body 350;`;
}

async function fetchOverpassEndpoint(endpoint: string, body: string, timeoutMs: number = 4500): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DevifyHighTicketLeadEngine/2.0 (devifylabs.com)'
      },
      body,
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export async function fetchLeadsFromOverpass(bbox: string = DEFAULT_BBOX): Promise<EnrichedLead[]> {
  const query = buildHighTicketOverpassQuery(bbox);
  const body = `data=${encodeURIComponent(query)}`;

  let responseData: any = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      responseData = await fetchOverpassEndpoint(endpoint, body, 4500);
      if (responseData && responseData.elements && responseData.elements.length > 0) {
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!responseData || !responseData.elements || responseData.elements.length === 0) {
    return FALLBACK_HIGH_TICKET_LEADS;
  }

  const rawElements: RawOSMElement[] = responseData.elements || [];
  const processedLeads = processAndSortRawElements(rawElements);

  if (processedLeads.length === 0) {
    return FALLBACK_HIGH_TICKET_LEADS;
  }

  return processedLeads.slice(0, 30);
}

export function getStoredLeads(): DailyLeadsResponse | null {
  if (globalThis._leadsCache) {
    return globalThis._leadsCache;
  }

  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      globalThis._leadsCache = parsed;
      return parsed;
    }
  } catch (e) {}

  const todayDate = new Date().toISOString().split('T')[0];
  const initialPayload: DailyLeadsResponse = {
    date: todayDate,
    timestamp: new Date().toISOString(),
    lastRefreshed: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
    count: FALLBACK_HIGH_TICKET_LEADS.length,
    leads: FALLBACK_HIGH_TICKET_LEADS,
    error: null
  };

  saveStoredLeads(initialPayload);
  return initialPayload;
}

export function saveStoredLeads(leadsResponse: DailyLeadsResponse): void {
  globalThis._leadsCache = leadsResponse;
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(leadsResponse, null, 2), 'utf8');
  } catch (e) {}
}
