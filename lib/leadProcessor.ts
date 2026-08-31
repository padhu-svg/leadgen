import { RawOSMElement, EnrichedLead, QualityScoreBreakdown } from './types';

// Micro-retail & low-budget business blacklist regex
const MICRO_RETAIL_BLACKLIST_REGEX = /\b(tea|stall|bakery|kirana|xerox|pan|juice|stores|provisional|tiffin|canteen|snack|chat|dairy|kiosk|greengrocer|vendor|general|mart|sweet|condiments|provision)\b/i;

const HIGH_VALUE_CATEGORY_SCORES: Record<string, { group: EnrichedLead['targetDomainGroup']; score: number; budget: string; problem: string; pitch: string }> = {
  // Healthcare & Wellness (+40 pts)
  clinic: {
    group: 'Healthcare & Wellness',
    score: 40,
    budget: '₹45,000 - ₹95,000',
    problem: "Patients cannot view doctor schedules or book consultations online, leading to phone queue bottlenecks.",
    pitch: "A doctor schedule portal & automated WhatsApp appointment booking assistant would streamline patient intake and eliminate phone delays."
  },
  dentist: {
    group: 'Healthcare & Wellness',
    score: 40,
    budget: '₹45,000 - ₹90,000',
    problem: "No online booking path for dental checkups; losing high-intent local patients searching on Google Maps.",
    pitch: "A clean dental booking portal with automated appointment reminders would increase high-ticket dental patient bookings."
  },
  doctors: {
    group: 'Healthcare & Wellness',
    score: 40,
    budget: '₹50,000 - ₹1,10,000',
    problem: "Polyclinic doctors lack a central digital schedule and patient appointment confirmation system.",
    pitch: "A multi-doctor schedule portal with automated SMS/WhatsApp reminders would reduce no-shows by 40%."
  },
  veterinary: {
    group: 'Healthcare & Wellness',
    score: 35,
    budget: '₹40,000 - ₹85,000',
    problem: "Pet owners cannot check vet clinic emergency hours or book vaccination appointments digitally.",
    pitch: "A pet care appointment booking site with vaccination schedule tracking would build recurring pet owner loyalty."
  },

  // B2B & Professional Services (+40 pts)
  accountant: {
    group: 'B2B & Professional',
    score: 40,
    budget: '₹60,000 - ₹1,40,000',
    problem: "Lacks a digital portal for tax consultation booking and client service package overviews.",
    pitch: "A professional accounting consultation web portal with automated calendar scheduling would attract high-margin corporate clients."
  },
  lawyer: {
    group: 'B2B & Professional',
    score: 40,
    budget: '₹75,000 - ₹1,80,000',
    problem: "Potential legal clients have no way to evaluate practice areas or book confidential case consultations online.",
    pitch: "A sleek law firm web application with 1-click confidential intake booking would position the firm for premium retainer work."
  },
  architect: {
    group: 'B2B & Professional',
    score: 40,
    budget: '₹85,000 - ₹2,20,000',
    problem: "Architectural project portfolios are shared via static PDF attachments instead of an interactive digital showcase.",
    pitch: "A high-end architectural portfolio web app with 3D project galleries would capture lucrative residential and commercial clients."
  },
  consulting: {
    group: 'B2B & Professional',
    score: 40,
    budget: '₹70,000 - ₹1,60,000',
    problem: "Missing a professional web presence to articulate advisory frameworks and capture enterprise leads.",
    pitch: "A corporate consultancy web portal with case study showcases would elevate brand authority and lead inquiries."
  },
  estate_agent: {
    group: 'B2B & Professional',
    score: 40,
    budget: '₹65,000 - ₹1,80,000',
    problem: "Property buyers cannot browse active villa and apartment listings or schedule site visits online.",
    pitch: "A luxury real estate property web app with interactive floor plans & WhatsApp lead capture would convert HNI buyers."
  },
  financial: {
    group: 'B2B & Professional',
    score: 40,
    budget: '₹65,000 - ₹1,50,000',
    problem: "Wealth management clients have no digital portal to review advisory services or schedule planning sessions.",
    pitch: "A secure financial planning web app with automated consultation booking would drive high-net-worth client acquisition."
  },

  // Hospitality & Venues (+35 pts)
  hotel: {
    group: 'Hospitality & Venues',
    score: 35,
    budget: '₹75,000 - ₹1,90,000',
    problem: "Hotel guests must book via OTAs, costing the hotel 20% in commission fees per room booking.",
    pitch: "A direct hotel booking website with instant UPI payment gateway integration would save thousands in OTA commissions."
  },
  events_venue: {
    group: 'Hospitality & Venues',
    score: 40,
    budget: '₹80,000 - ₹2,50,000',
    problem: "Wedding and corporate event planners have no way to take virtual venue tours or submit date availability inquiries.",
    pitch: "An interactive event venue showcase web portal with 3D venue tours & date booking widgets would double banquet sales."
  },
  resort: {
    group: 'Hospitality & Venues',
    score: 40,
    budget: '₹80,000 - ₹2,20,000',
    problem: "Resort weekend packages rely on manual phone calls, missing out on direct weekend staycation bookings.",
    pitch: "A staycation resort booking web app with advance deposit collection would capture lucrative weekend getaway bookings."
  },

  // High-Ticket Local Services (+35 pts)
  car_repair: {
    group: 'High-Ticket Local Services',
    score: 35,
    budget: '₹50,000 - ₹1,20,000',
    problem: "Vehicle owners cannot view service price estimates or schedule workshop repair slots digitally.",
    pitch: "An auto repair service estimate calculator & slot booking web app would streamline daily workshop check-ins."
  },
  motorcycle_repair: {
    group: 'High-Ticket Local Services',
    score: 30,
    budget: '₹35,000 - ₹75,000',
    problem: "Superbike and commuter owners have no digital channel to request service quotes or track repair status.",
    pitch: "A bike service booking site with WhatsApp job-card updates would build customer trust and repeat servicing."
  },
  fitness_centre: {
    group: 'High-Ticket Local Services',
    score: 35,
    budget: '₹40,000 - ₹85,000',
    problem: "No web portal for trial class signups, workout schedules, or membership pass purchases.",
    pitch: "A trial class booking web app with instant UPI pass payments would convert social media traffic into paid gym members."
  },
  optician: {
    group: 'High-Ticket Local Services',
    score: 35,
    budget: '₹45,000 - ₹90,000',
    problem: "Eye care clients cannot book eye checkup appointments or browse designer eyewear collections online.",
    pitch: "An optical clinic appointment booking website with a digital frame catalog would drive high-margin eyewear sales."
  },
  interior_decorator: {
    group: 'High-Ticket Local Services',
    score: 40,
    budget: '₹75,000 - ₹2,00,000',
    problem: "Interior design portfolios are restricted to Instagram, lacking a structured project portfolio site.",
    pitch: "A luxury interior design portfolio web app with room transformation galleries would land high-budget home renovations."
  }
};

export function evaluateLeadQuality(element: RawOSMElement): EnrichedLead | null {
  const tags = element.tags || {};
  const name = (tags.name || '').trim();
  const hasWebsite = Boolean(tags.website || tags['contact:website'] || tags.url);

  // 1. Strict Exclusion Filters
  if (!name || hasWebsite) return null;

  const lowerName = name.toLowerCase();

  // Disqualify micro-retailers (tea stalls, kirana shops, pan shops, Xerox, bakeries)
  if (MICRO_RETAIL_BLACKLIST_REGEX.test(lowerName) || name.split(/\s+/).length < 2) {
    return null;
  }

  // Identify Category
  const rawCat = (tags.office || tags.amenity || tags.tourism || tags.leisure || tags.shop || tags.healthcare || 'commercial').toLowerCase();
  const meta = HIGH_VALUE_CATEGORY_SCORES[rawCat] || {
    group: 'Commercial Service' as EnrichedLead['targetDomainGroup'],
    score: 25,
    budget: '₹45,000 - ₹95,000',
    problem: "Has no official website or digital portal for local customer inquiries.",
    pitch: "A fast, modern responsive website with 1-click WhatsApp lead capture would capture new local customers."
  };

  // 2. Score Calculation (0 to 100)
  let contactScore = 0;
  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || 'N/A';
  const email = tags.email || tags['contact:email'] || 'N/A';

  if (phone !== 'N/A') contactScore += 20;
  if (email !== 'N/A') contactScore += 10;

  const categoryScore = meta.score; // 25 to 40 pts

  let locationScore = 0;
  const houseNumber = tags['addr:housenumber'] || '';
  const street = tags['addr:street'] || tags['addr:full'] || '';
  const suburb = tags['addr:suburb'] || tags['addr:district'] || '';
  const postcode = tags['addr:postcode'] || '';
  const city = tags['addr:city'] || 'Bengaluru';

  if (street) locationScore += 8;
  if (suburb || postcode) locationScore += 7;

  let totalScore = contactScore + categoryScore + locationScore;
  totalScore = Math.min(100, Math.max(10, totalScore));

  const breakdown: QualityScoreBreakdown = {
    contactAvailabilityScore: contactScore,
    categoryValueScore: categoryScore,
    locationMetadataScore: locationScore,
    brandQualityScore: 0,
    totalScore
  };

  const locationParts = [houseNumber, street, suburb, city].filter(Boolean);
  const location = locationParts.join(', ') || 'Bengaluru';
  const osmId = element.id;
  const osmUrl = `https://www.openstreetmap.org/node/${osmId}`;
  const lat = element.lat;
  const lon = element.lon;

  const nameEnc = encodeURIComponent(name);
  const gmapsUrl = lat && lon 
    ? `https://www.google.com/maps/search/${nameEnc}/@${lat},${lon},17z` 
    : `https://www.google.com/maps/search/?api=1&query=${nameEnc}+${encodeURIComponent(location)}`;

  const gmapsPinUrl = lat && lon ? `https://maps.google.com/?q=${lat},${lon}` : gmapsUrl;

  return {
    id: `osm-${osmId}`,
    osmId,
    businessName: name,
    categoryKey: rawCat,
    categoryDisplay: meta.group === 'Healthcare & Wellness' ? `${rawCat.replace('_', ' ').toUpperCase()} (Healthcare)` : rawCat.replace('_', ' ').toUpperCase(),
    targetDomainGroup: meta.group,
    location,
    phone,
    email,
    signal: "No website found",
    osmUrl,
    gmapsUrl,
    gmapsPinUrl,
    qualityScore: totalScore,
    scoreBreakdown: breakdown,
    estimatedBudget: meta.budget,
    problemDescription: meta.problem,
    pitch: meta.pitch,
    lat,
    lon
  };
}

export function processAndSortRawElements(elements: RawOSMElement[]): EnrichedLead[] {
  const enriched: EnrichedLead[] = [];
  const seenNames = new Set<string>();

  for (const el of elements) {
    const lead = evaluateLeadQuality(el);
    if (lead) {
      const cleanName = lead.businessName.toLowerCase();
      if (!seenNames.has(cleanName)) {
        seenNames.add(cleanName);
        enriched.push(lead);
      }
    }
  }

  // Sort descending by Quality Score
  return enriched.sort((a, b) => b.qualityScore - a.qualityScore);
}
