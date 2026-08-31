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

export function buildHighTicketOverpassQuery(bbox: string = DEFAULT_BBOX): string {
  return `[out:json][timeout:6];
(
  node["amenity"~"clinic|dentist|doctors|veterinary|events_venue"](${bbox});
  node["office"~"accountant|lawyer|architect|consulting|estate_agent|financial"](${bbox});
  node["tourism"~"hotel|guest_house"](${bbox});
  node["leisure"~"resort|fitness_centre"](${bbox});
  node["shop"~"car_repair|motorcycle_repair|optician|interior_decorator"](${bbox});
);
out body 250;`;
}

// Fast sub-2.5-second fetch with AbortController
async function fetchSingleEndpoint(endpoint: string, body: string, timeoutMs: number = 2500): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.elements && data.elements.length > 0) {
        return data;
      }
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function fetchLeadsFromOverpass(bbox: string = DEFAULT_BBOX): Promise<EnrichedLead[]> {
  const query = buildHighTicketOverpassQuery(bbox);
  const body = `data=${encodeURIComponent(query)}`;

  try {
    // Race all endpoints simultaneously with 2.5s hard limit
    const responseData = await Promise.any(
      OVERPASS_ENDPOINTS.map(ep => fetchSingleEndpoint(ep, body, 2500))
    );

    if (responseData && responseData.elements && responseData.elements.length > 0) {
      const rawElements: RawOSMElement[] = responseData.elements;
      const processed = processAndSortRawElements(rawElements);
      if (processed.length > 0) {
        return processed.slice(0, 30);
      }
    }
  } catch (e) {
    // If all endpoints fail or time out (>2.5s), return fallback immediately
  }

  return FALLBACK_HIGH_TICKET_LEADS;
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
