export interface RawOSMTags {
  name?: string;
  website?: string;
  'contact:website'?: string;
  url?: string;
  phone?: string;
  'contact:phone'?: string;
  'contact:mobile'?: string;
  email?: string;
  'contact:email'?: string;
  amenity?: string;
  office?: string;
  tourism?: string;
  leisure?: string;
  shop?: string;
  healthcare?: string;
  'addr:housenumber'?: string;
  'addr:street'?: string;
  'addr:full'?: string;
  'addr:suburb'?: string;
  'addr:district'?: string;
  'addr:postcode'?: string;
  'addr:city'?: string;
  [key: string]: string | undefined;
}

export interface RawOSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: RawOSMTags;
}

export interface QualityScoreBreakdown {
  contactAvailabilityScore: number; // Max 30 pts
  categoryValueScore: number;       // Max 40 pts
  locationMetadataScore: number;     // Max 15 pts
  brandQualityScore: number;         // Penalty or Bonus
  totalScore: number;                // 0 to 100
}

export interface EnrichedLead {
  id: string;
  osmId: number;
  businessName: string;
  categoryKey: string;
  categoryDisplay: string;
  targetDomainGroup: 'Healthcare & Wellness' | 'B2B & Professional' | 'Hospitality & Venues' | 'High-Ticket Local Services' | 'Commercial Service';
  location: string;
  phone: string;
  email: string;
  signal: string;
  osmUrl: string;
  gmapsUrl: string;
  gmapsPinUrl: string;
  qualityScore: number;
  scoreBreakdown: QualityScoreBreakdown;
  estimatedBudget: string;
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
  leads: EnrichedLead[];
  error?: string | null;
}
