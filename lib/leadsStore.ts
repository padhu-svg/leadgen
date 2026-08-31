import fs from 'fs';
import path from 'path';
import { FALLBACK_BANGALORE_LEADS } from './fallbackLeads';

export interface Lead {
  id: string;
  osmId: number;
  businessName: string;
  category: string;
  location: string;
  phone: string;
  signal: string;
  osmUrl: string;
  gmapsUrl: string;
  gmapsSearchUrl?: string;
  problemDescription: string;
  pitch: string;
  lat?: number;
  lon?: number;
}

export interface DailyLeadsResponse {
  date: string;
  timestamp: string;
  count: number;
  lastRefreshed: string;
  leads: Lead[];
  error?: string | null;
}

const CACHE_FILE = process.env.VERCEL ? '/tmp/leads_cache.json' : path.join(process.cwd(), 'leads_cache.json');
const DEFAULT_BBOX = process.env.TARGET_CITY_BBOX || "12.88,77.50,13.10,77.72"; // Bangalore Bounding Box

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.nchc.org.tw/api/interpreter"
];

const GENERIC_EXCLUSION_SET = new Set([
  "clinic", "dental clinic", "medical clinic", "restaurant", "cafe", "coffee shop", 
  "salon", "barber", "shop", "bakery", "doctor", "auto repair", "garage", "gym",
  "hotel", "spa", "store", "supermarket", "boutique", "fitness centre"
]);

declare global {
  var _leadsCache: DailyLeadsResponse | null;
}

const CATEGORY_MAP: Record<string, { display: string; problem: string; pitch: string }> = {
  cafe: {
    display: "Café & Coffee Shop",
    problem: "Relies entirely on walk-ins and Swiggy/Zomato — no direct way for new customers to view digital menus or order directly.",
    pitch: "A lightweight digital menu & WhatsApp order web app would let them capture direct pickup orders without paying 20% third-party commissions."
  },
  restaurant: {
    display: "Restaurant & Eatery",
    problem: "Lacks a direct mobile site for table reservations or digital menu browsing outside walk-in hours.",
    pitch: "A fast online reservation & QR digital menu web app would turn Google search traffic into direct weekend table bookings."
  },
  bar: {
    display: "Bar & Pub",
    problem: "No web presence to showcase weekend event schedules, drink menus, or VIP table reservations.",
    pitch: "An event schedule & table reservation web portal would capture party bookings and increase weekend guest turnout."
  },
  salon: {
    display: "Salon & Hairdresser",
    problem: "Customers must call or visit in person to inquire about service prices and appointments — zero online booking path.",
    pitch: "An automated WhatsApp appointment booking assistant & service menu site would let clients schedule appointments 24/7."
  },
  hairdresser: {
    display: "Salon & Barber Shop",
    problem: "No digital booking menu; peak weekend appointment requests get lost in unreturned phone calls.",
    pitch: "A 1-click slot booking web app with automated SMS/WhatsApp reminders would eliminate scheduling chaos."
  },
  estate_agent: {
    display: "Real Estate Agency",
    problem: "Property buyers have no way to browse current property listings or request site visits online.",
    pitch: "A high-converting property portfolio web app with 1-click WhatsApp lead capture would capture high-ticket HNI buyers."
  },
  clinic: {
    display: "Medical Clinic",
    problem: "Patients cannot view doctor schedules or book consultations online, leading to high phone queue friction.",
    pitch: "A doctor schedule site & automated WhatsApp appointment booking assistant would streamline patient check-ins."
  },
  dentist: {
    display: "Dental Practice",
    problem: "No online booking portal for dental checkups; missing out on high-intent local search patients.",
    pitch: "A clean dental booking portal with automated appointment reminders would increase new patient intakes."
  },
  car_repair: {
    display: "Auto Repair & Garage",
    problem: "Vehicle owners cannot get instant service cost estimates or book repair slots digitally.",
    pitch: "An interactive service estimate calculator & booking web app would streamline daily workshop check-ins."
  },
  bakery: {
    display: "Bakery & Confectionery",
    problem: "Custom cake and order requests are handled manually via phone calls, causing order errors.",
    pitch: "A digital cake catalog & order customization web app with instant UPI payments would automate daily pre-orders."
  },
  boutique: {
    display: "Boutique & Retail Store",
    problem: "Inventory and new arrivals are only shared via Instagram DMs, creating sales bottlenecks.",
    pitch: "A digital product showcase catalog with instant WhatsApp order buttons would boost direct retail sales."
  },
  gym: {
    display: "Gym & Fitness Centre",
    problem: "No web portal for trial class signups, workout schedules, or membership pass purchases.",
    pitch: "A trial class booking web app with instant UPI pass payments would convert social media traffic into paid members."
  },
  fitness_centre: {
    display: "Fitness & Wellness Studio",
    problem: "Missing a central schedule portal for class passes and personal trainer bookings.",
    pitch: "A modern class schedule & trainer reservation web app would boost monthly membership renewals."
  }
};

async function fetchOverpassEndpoint(endpoint: string, body: string, timeoutMs: number = 4000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'DevifyLabsLeadEngine/1.0 (devifylabs.com)'
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

export async function fetchLeadsFromOverpass(bbox: string = DEFAULT_BBOX): Promise<Lead[]> {
  const query = `[out:json][timeout:8];
(
  node["amenity"~"cafe|restaurant|bar|clinic|dentist|gym"](${bbox});
  node["shop"~"salon|hairdresser|bakery|car_repair|boutique"](${bbox});
  node["office"="estate_agent"](${bbox});
  node["leisure"="fitness_centre"](${bbox});
);
out body 250;`;

  const body = `data=${encodeURIComponent(query)}`;

  let responseData: any = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      responseData = await fetchOverpassEndpoint(endpoint, body, 4000);
      if (responseData && responseData.elements && responseData.elements.length > 0) {
        break;
      }
    } catch (e) {
      continue;
    }
  }

  // Fail-safe: If Overpass API is down/times out, return pre-verified Bangalore leads immediately!
  if (!responseData || !responseData.elements || responseData.elements.length === 0) {
    return FALLBACK_BANGALORE_LEADS;
  }

  const elements = responseData.elements || [];
  const qualified: Lead[] = [];

  for (const e of elements) {
    const tags = e.tags || {};
    const name = (tags.name || '').trim();
    const hasWebsite = Boolean(tags.website || tags['contact:website']);

    if (name && !hasWebsite) {
      const lowerName = name.toLowerCase();

      if (GENERIC_EXCLUSION_SET.has(lowerName) || name.split(/\s+/).length < 2) {
        continue;
      }

      const rawCategoryKey = (tags.amenity || tags.shop || tags.office || tags.leisure || 'local_business').toLowerCase();
      const meta = CATEGORY_MAP[rawCategoryKey] || {
        display: rawCategoryKey.replace('_', ' ').toUpperCase(),
        problem: "Has no official website or digital portal for local customer inquiries.",
        pitch: "A fast, modern responsive website with 1-click WhatsApp lead capture would capture new customers."
      };

      const phone = tags.phone || tags['contact:phone'] || 'N/A';
      const houseNumber = tags['addr:housenumber'] || '';
      const street = tags['addr:street'] || tags['addr:full'] || '';
      const suburb = tags['addr:suburb'] || tags['addr:district'] || '';
      const city = tags['addr:city'] || 'Bengaluru';
      
      const locationParts = [houseNumber, street, suburb, city].filter(Boolean);
      const location = locationParts.join(', ') || 'Bengaluru';
      
      const osmId = e.id;
      const osmUrl = `https://www.openstreetmap.org/node/${osmId}`;
      const lat = e.lat;
      const lon = e.lon;

      const nameEnc = encodeURIComponent(name);
      
      const gmapsUrl = lat && lon 
        ? `https://www.google.com/maps/search/${nameEnc}/@${lat},${lon},17z` 
        : `https://www.google.com/maps/search/?api=1&query=${nameEnc}+${encodeURIComponent(location)}`;

      const gmapsPinUrl = lat && lon 
        ? `https://maps.google.com/?q=${lat},${lon}` 
        : gmapsUrl;

      qualified.push({
        id: `osm-${osmId}`,
        osmId,
        businessName: name,
        category: meta.display,
        location: location || 'Bengaluru',
        phone,
        signal: "No website found",
        osmUrl,
        gmapsUrl,
        gmapsPinUrl,
        problemDescription: meta.problem,
        pitch: meta.pitch,
        lat,
        lon
      });
    }
  }

  if (qualified.length === 0) {
    return FALLBACK_BANGALORE_LEADS;
  }

  const shuffled = qualified.sort(() => 0.5 - Math.random());
  const uniqueLeads: Lead[] = [];
  const seenNames = new Set<string>();

  for (const lead of shuffled) {
    const cleanName = lead.businessName.trim().toLowerCase();
    if (!seenNames.has(cleanName)) {
      seenNames.add(cleanName);
      uniqueLeads.push(lead);
    }
    if (uniqueLeads.length >= 30) break;
  }

  return uniqueLeads.length > 0 ? uniqueLeads : FALLBACK_BANGALORE_LEADS;
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

  // Fail-safe initial payload
  const todayDate = new Date().toISOString().split('T')[0];
  const initialPayload: DailyLeadsResponse = {
    date: todayDate,
    timestamp: new Date().toISOString(),
    lastRefreshed: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
    count: FALLBACK_BANGALORE_LEADS.length,
    leads: FALLBACK_BANGALORE_LEADS,
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
