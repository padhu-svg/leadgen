'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Check, 
  Copy, 
  Zap, 
  MapPin, 
  Phone, 
  Download, 
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Building2,
  Stethoscope,
  Coffee,
  Hotel,
  Dumbbell
} from 'lucide-react';

const INITIAL_BANGALORE_LEADS = [
  {
    id: "inst-1",
    businessName: "Third Wave Coffee (Indiranagar)",
    category: "Cafes & Restaurants",
    location: "100 Feet Rd, Indiranagar, Bengaluru",
    contactPhone: "080 4965 2100",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Third%20Wave%20Coffee%20Indiranagar%20Bengaluru",
    priceTag: "₹35,000 - ₹65,000",
    currentStatus: "Missing Direct QR Code Menu & Table Ordering Web App",
    whatTheyNeed: "QR Code Digital Menu + Table Ordering & UPI Payment Web App",
    whyDevifyHelps: "Saves 15%-25% commission paid to Swiggy/Zomato on direct dine-in & pickup orders.",
    whatsappPitch: "Hi! Loved visiting Third Wave Coffee in Indiranagar. Noticed you're relying only on paper menus or Swiggy. Devify Labs builds custom QR Menu & Table Ordering Web Apps for Bangalore cafes in 4 days. Can I send a 30-sec video demo?"
  },
  {
    id: "inst-2",
    businessName: "Glen's Bakehouse",
    category: "Cafes & Restaurants",
    location: "Indiranagar 2nd Stage, Bengaluru",
    contactPhone: "080 4122 8773",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Glens%20Bakehouse%20Indiranagar%20Bengaluru",
    priceTag: "₹35,000 - ₹60,000",
    currentStatus: "High Dine-In Queue / Missing Online Pre-Ordering Web App",
    whatTheyNeed: "Pre-Ordering & QR Bakery Menu Web Application",
    whyDevifyHelps: "Reduces weekend counter wait times and captures direct takeaway orders.",
    whatsappPitch: "Hi Team! Glen's Bakehouse in Indiranagar is always buzzing. We build custom pre-ordering & QR menu web apps for Bangalore bakeries so customers can order directly online. Open to seeing a quick concept?"
  },
  {
    id: "inst-3",
    businessName: "Prestige Estates Projects",
    category: "Real Estate & Builders",
    location: "Koramangala, Bengaluru",
    contactPhone: "080 2559 1080",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Prestige%20Estates%20Projects%20Koramangala%20Bengaluru",
    priceTag: "₹65,000 - ₹1,80,000",
    currentStatus: "Outdated Mobile Layout / Missing Property Showcase Web App",
    whatTheyNeed: "Luxury Real Estate Web Application (Interactive Floor Plans & WhatsApp Lead Widget)",
    whyDevifyHelps: "Captures high-ticket HNI villa & apartment buyers with 1-click WhatsApp inquiry buttons.",
    whatsappPitch: "Hello! Saw your luxury property listings in Koramangala. Your current mobile site delay is costing you high-ticket HNI leads. At Devify Labs, we build modern real estate web apps with 1-click WhatsApp lead capture. Open to seeing a free homepage concept?"
  },
  {
    id: "inst-4",
    businessName: "Clove Dental Clinic",
    category: "Clinics & Healthcare",
    location: "HSR Layout Sector 1, Bengaluru",
    contactPhone: "1800 120 0033",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Clove%20Dental%20Clinic%20HSR%20Layout%20Bengaluru",
    priceTag: "₹45,000 - ₹95,000",
    currentStatus: "Missing Online Appointment Booking & Schedule System",
    whatTheyNeed: "Doctor Appointment Booking Website & Patient Schedule Portal",
    whyDevifyHelps: "Captures local patients searching on Google Maps; automates appointment reminders via WhatsApp.",
    whatsappPitch: "Hi Doctor! Saw your clinic listing in HSR Layout on Google Maps, but noticed you don't have an online appointment booking website yet. Devify Labs builds doctor appointment web portals in 5 days. Can I send a quick preview?"
  },
  {
    id: "inst-5",
    businessName: "Kosmoderma Skin & Hair Clinic",
    category: "Clinics & Healthcare",
    location: "Indiranagar 100 Feet Rd, Bengaluru",
    contactPhone: "076767 55555",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kosmoderma%20Skin%20Clinic%20Indiranagar%20Bengaluru",
    priceTag: "₹50,000 - ₹1,10,000",
    currentStatus: "Missing Skincare Consultation Booking & Product Store Web App",
    whatTheyNeed: "Cosmetic Dermatology Booking & E-Commerce Web App",
    whyDevifyHelps: "Allows clients to book treatments and purchase recommended skincare products directly.",
    whatsappPitch: "Hi Kosmoderma Team! Love your dermatology work in Indiranagar. Devify Labs builds skincare treatment booking & e-commerce web apps for Bangalore skin clinics. Can I send over 2 case study concepts?"
  },
  {
    id: "inst-6",
    businessName: "The Paul Bangalore Hotel",
    category: "Hotels & Staycations",
    location: "Domlur, Near Indiranagar, Bengaluru",
    contactPhone: "080 4047 7777",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Paul%20Bangalore%20Hotel%20Domlur%20Bengaluru",
    priceTag: "₹60,000 - ₹1,50,000",
    currentStatus: "Slow Mobile Photo Gallery / Missing Direct Booking Engine",
    whatTheyNeed: "Resort Website + Direct Booking & UPI Advance Payment Web App",
    whyDevifyHelps: "Enables guests to book directly, bypassing 20% commission paid to MakeMyTrip/Agoda.",
    whatsappPitch: "Hi Team! The Paul Bangalore looks stunning, but your mobile site is missing a direct booking engine, forcing guests to pay extra on OTAs. Devify Labs builds direct-booking resort websites with instant UPI advance payment. Open to a 2-min demo?"
  },
  {
    id: "inst-7",
    businessName: "Cult Fit Gym & Fitness Studio",
    category: "Gyms & Fitness Studios",
    location: "HSR Layout Sector 3, Bengaluru",
    contactPhone: "080 6848 8888",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Cult%20Fit%20Gym%20HSR%20Layout%20Bengaluru",
    priceTag: "₹30,000 - ₹60,000",
    currentStatus: "Only Instagram Profile / Missing Class Booking Web App",
    whatTheyNeed: "Fitness Studio Website + Class Trial Booking Web App",
    whyDevifyHelps: "Converts Instagram followers into paid gym members via bio trial booking links.",
    whatsappPitch: "Hey Team! Loved your workout videos in HSR Layout. Noticed your bio link only goes to a raw WhatsApp number instead of a proper class booking page. Devify Labs builds class trial booking web apps for Bangalore gyms in 3 days. Can I send a quick preview?"
  }
];

export default function Home() {
  const [leads, setLeads] = useState(INITIAL_BANGALORE_LEADS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrapeCategory, setScrapeCategory] = useState('Cafes & Restaurants');
  const [scrapeLocation, setScrapeLocation] = useState('Indiranagar Bengaluru');
  const [scraping, setScraping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredLeads = activeCategory === 'All' 
    ? leads 
    : leads.filter(l => l.category === activeCategory);

  const copyPitch = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `${scrapeCategory} ${scrapeLocation}`,
          category: scrapeCategory 
        })
      });
      const data = await res.json();
      if (data.places && data.places.length > 0) {
        setLeads(data.places);
      }
    } catch (e) {
    } finally {
      setScraping(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Business Name", "Category", "Location", "Phone Number", "Google Maps URL", "Price Tag", "Current Issue", "What Devify Builds", "Why They Buy", "WhatsApp Pitch"];
    const lines = [headers.join(",")];
    
    leads.forEach(l => {
      const row = [
        `"${(l.businessName || '').replace(/"/g, '""')}"`,
        `"${(l.category || '').replace(/"/g, '""')}"`,
        `"${(l.location || '').replace(/"/g, '""')}"`,
        `"${(l.contactPhone || '').replace(/"/g, '""')}"`,
        `"${(l.mapsUrl || '').replace(/"/g, '""')}"`,
        `"${(l.priceTag || '').replace(/"/g, '""')}"`,
        `"${(l.currentStatus || '').replace(/"/g, '""')}"`,
        `"${(l.whatTheyNeed || '').replace(/"/g, '""')}"`,
        `"${(l.whyDevifyHelps || '').replace(/"/g, '""')}"`,
        `"${(l.whatsappPitch || '').replace(/"/g, '""')}"`
      ];
      lines.push(row.join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Devify_Reachable_Leads_Database.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">DEVIFY LABS</span>
              <span className="text-xs text-emerald-400 font-mono ml-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">Reachable Client Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800 text-xs px-4 py-2 rounded-lg font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV (Excel)
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-6">
        
        {/* HERO TITLE CARD */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Reachable Client Leads Database</h1>
            <p className="text-slate-400 text-xs mt-1">Verified Bangalore businesses (Cafes, Real Estate, Clinics, Resorts, Gyms) with direct Google Maps phone numbers & WhatsApp outreach scripts.</p>
          </div>

          <span className="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg shrink-0">
            {leads.length} Verified Leads Ready
          </span>
        </div>

        {/* LIVE GOOGLE MAPS SCRAPER CONTROL BAR */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Scrape Google Maps Places Live in Real-Time</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Select Business Category:</label>
              <select 
                value={scrapeCategory}
                onChange={(e) => setScrapeCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="Cafes & Restaurants">☕ Cafes & Restaurants</option>
                <option value="Clinics & Healthcare">🩺 Dental & Medical Clinics</option>
                <option value="Real Estate & Builders">🏢 Real Estate Brokers & Builders</option>
                <option value="Hotels & Staycations">🏨 Homestays & Boutique Resorts</option>
                <option value="Gyms & Fitness Studios">🏋️ Gyms & CrossFit Studios</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Select Bangalore Locality:</label>
              <select 
                value={scrapeLocation}
                onChange={(e) => setScrapeLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              >
                <option value="Indiranagar Bengaluru">Indiranagar, Bangalore</option>
                <option value="Koramangala Bengaluru">Koramangala, Bangalore</option>
                <option value="HSR Layout Bengaluru">HSR Layout, Bangalore</option>
                <option value="Whitefield Bengaluru">Whitefield, Bangalore</option>
                <option value="Jayanagar Bengaluru">Jayanagar, Bangalore</option>
                <option value="Malleshwaram Bengaluru">Malleshwaram, Bangalore</option>
                <option value="Sarjapur Road Bengaluru">Sarjapur Road, Bangalore</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleScrape}
                disabled={scraping}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs p-3 rounded-xl transition flex items-center justify-center gap-2 font-mono cursor-pointer"
              >
                {scraping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                {scraping ? 'Scraping Live...' : 'Scrape Google Maps Places Live'}
              </button>
            </div>
          </div>
        </div>

        {/* CATEGORY FILTER BUTTONS */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <button 
            onClick={() => setActiveCategory('All')} 
            className={`px-3.5 py-2 rounded-lg font-mono transition ${activeCategory === 'All' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            All Categories
          </button>
          <button 
            onClick={() => setActiveCategory('Cafes & Restaurants')} 
            className={`px-3.5 py-2 rounded-lg font-mono transition ${activeCategory === 'Cafes & Restaurants' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            ☕ Cafes
          </button>
          <button 
            onClick={() => setActiveCategory('Real Estate & Builders')} 
            className={`px-3.5 py-2 rounded-lg font-mono transition ${activeCategory === 'Real Estate & Builders' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            🏢 Real Estate
          </button>
          <button 
            onClick={() => setActiveCategory('Clinics & Healthcare')} 
            className={`px-3.5 py-2 rounded-lg font-mono transition ${activeCategory === 'Clinics & Healthcare' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            🩺 Clinics
          </button>
          <button 
            onClick={() => setActiveCategory('Hotels & Staycations')} 
            className={`px-3.5 py-2 rounded-lg font-mono transition ${activeCategory === 'Hotels & Staycations' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            🏨 Resorts
          </button>
          <button 
            onClick={() => setActiveCategory('Gyms & Fitness Studios')} 
            className={`px-3.5 py-2 rounded-lg font-mono transition ${activeCategory === 'Gyms & Fitness Studios' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'}`}
          >
            🏋️ Gyms
          </button>
        </div>

        {/* LEADS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLeads.map((l, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition space-y-4 relative overflow-hidden">
              <div class="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">{l.category}</span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.location}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{l.businessName}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-emerald-400 font-bold">{l.priceTag}</div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Verified Lead</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-amber-300 font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone: {l.contactPhone}</span>
                  <a href={l.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    📍 Real Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-rose-400 font-medium"><span className="text-slate-400 font-bold">Issue:</span> {l.currentStatus}</div>
                <div className="text-emerald-300 font-medium"><span class="text-slate-400 font-bold">Devify Builds:</span> {l.whatTheyNeed}</div>
                <div className="text-slate-300"><span className="text-slate-400 font-bold">Why They Buy:</span> {l.whyDevifyHelps}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>WhatsApp Pitch Script</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyPitch(l.whatsappPitch, idx)}
                      className="text-[11px] text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 hover:bg-emerald-900 cursor-pointer flex items-center gap-1"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedIndex === idx ? 'Copied!' : 'Copy Script'}
                    </button>
                    <a 
                      href={l.mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[11px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded flex items-center gap-1"
                    >
                      Open Live Contact on Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 text-xs font-mono text-slate-300 border border-slate-800 leading-relaxed">
                  {l.whatsappPitch}
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        Devify Labs Lead Portal • Live Vercel & Google Maps Engine • {new Date().getFullYear()}
      </footer>

    </div>
  );
}
