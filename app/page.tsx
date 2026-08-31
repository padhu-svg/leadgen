'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  Check, 
  Copy, 
  Zap, 
  MapPin, 
  Phone, 
  Download, 
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  FileQuestion,
  Wrench,
  Building2,
  Stethoscope,
  Coffee,
  ShoppingBag,
  Car,
  Dumbbell,
  Layers,
  Utensils
} from 'lucide-react';

interface Lead {
  id: string;
  osmId: number;
  businessName: string;
  category: string;
  location: string;
  phone: string;
  signal: string;
  osmUrl: string;
  problemDescription: string;
  pitch: string;
  lat?: number;
  lon?: number;
}

interface LeadsPayload {
  date: string;
  timestamp: string;
  lastRefreshed: string;
  count: number;
  leads: Lead[];
  error?: string | null;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'opportunities' | 'auditor' | 'customizer'>('opportunities');
  const [payload, setPayload] = useState<LeadsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auditor State
  const [auditUrl, setAuditUrl] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const fetchLeads = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const method = forceRefresh ? 'POST' : 'GET';
      const res = await fetch('/api/leads', { method, cache: 'no-store' });
      const data = await res.json();
      setPayload(data);
    } catch (err: any) {
      setPayload({
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        lastRefreshed: 'Unavailable',
        count: 0,
        leads: [],
        error: "Couldn't fetch live leads — Overpass API unavailable, try refreshing."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const copyPitch = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runAudit = async () => {
    if (!auditUrl.trim()) return;
    setAuditLoading(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: auditUrl })
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (e) {
      setAuditResult({ error: "Failed to audit website connection." });
    } finally {
      setAuditLoading(false);
    }
  };

  const exportCSV = () => {
    if (!payload || !payload.leads || payload.leads.length === 0) return;
    const headers = ["Business Name", "Category", "Location", "Phone Number", "Signal", "OSM Map Listing", "Problem Description", "Devify Pitch"];
    const lines = [headers.join(",")];
    
    payload.leads.forEach(l => {
      const row = [
        `"${(l.businessName || '').replace(/"/g, '""')}"`,
        `"${(l.category || '').replace(/"/g, '""')}"`,
        `"${(l.location || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.signal || '').replace(/"/g, '""')}"`,
        `"${(l.osmUrl || '').replace(/"/g, '""')}"`,
        `"${(l.problemDescription || '').replace(/"/g, '""')}"`,
        `"${(l.pitch || '').replace(/"/g, '""')}"`
      ];
      lines.push(row.join(","));
    });

    const blob = new Blob([lines.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Devify_NoWebsite_Leads_${payload.date || 'today'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('caf') || cat.includes('coffee')) return <Coffee className="w-3.5 h-3.5" />;
    if (cat.includes('restaurant') || cat.includes('eatery')) return <Utensils className="w-3.5 h-3.5" />;
    if (cat.includes('salon') || cat.includes('hair')) return <ShoppingBag className="w-3.5 h-3.5" />;
    if (cat.includes('real estate')) return <Building2 className="w-3.5 h-3.5" />;
    if (cat.includes('clinic') || cat.includes('medical') || cat.includes('dental')) return <Stethoscope className="w-3.5 h-3.5" />;
    if (cat.includes('car') || cat.includes('auto')) return <Car className="w-3.5 h-3.5" />;
    if (cat.includes('gym') || cat.includes('fitness')) return <Dumbbell className="w-3.5 h-3.5" />;
    return <Globe className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">DEVIFY LABS</span>
              <span className="text-xs text-emerald-400 font-mono ml-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">Client Acquisition & Audit Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {payload && payload.leads && payload.leads.length > 0 && (
              <button
                onClick={exportCSV}
                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800 text-xs px-3.5 py-2 rounded-lg font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV ({payload.leads.length} Leads)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-4 font-mono">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'opportunities'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ Live Client Opportunities ({loading ? '...' : (payload?.count || 0)})</span>
          </button>

          <button
            onClick={() => setActiveTab('auditor')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'auditor'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🌐 Website Auditor & Pitcher</span>
          </button>

          <button
            onClick={() => setActiveTab('customizer')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'customizer'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📝 Pitch Customizer</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-6">
        
        {/* TAB 1: LIVE CLIENT OPPORTUNITIES */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            
            {/* HERO BAR */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">Real Local Businesses (No Website Found)</h1>
                <p className="text-slate-400 text-xs mt-1">Queried live from OpenStreetMap Overpass API. Filtered specifically for un-webbed local services, cafes, real estate, clinics, & garages.</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-xs font-mono text-slate-400">
                  <div>Last refreshed: <span className="text-emerald-400 font-bold">{payload?.lastRefreshed || 'Just now'}</span></div>
                  <div className="text-[10px] text-slate-500">24-hour Daily Auto Rotation</div>
                </div>

                <button
                  onClick={() => fetchLeads(true)}
                  disabled={refreshing}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 font-mono cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh 30 Leads'}
                </button>
              </div>
            </div>

            {/* ERROR BANNER */}
            {payload?.error && (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-white">Live Data Feed Notice</div>
                  <div>{payload.error}</div>
                </div>
              </div>
            )}

            {/* LOADING SKELETON */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-16 bg-slate-950 rounded"></div>
                    <div className="h-20 bg-slate-950 rounded"></div>
                  </div>
                ))}
              </div>
            )}

            {/* EMPTY STATE */}
            {!loading && (!payload || !payload.leads || payload.leads.length === 0) && (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4 max-w-xl mx-auto my-12">
                <FileQuestion className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
                <h3 className="text-lg font-bold text-white">Couldn't fetch live leads</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Overpass API is currently experiencing rate limits or timeouts. Please click the refresh button below to re-query live local business listings.
                </p>
                <button
                  onClick={() => fetchLeads(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition font-mono cursor-pointer"
                >
                  Try Refreshing Now
                </button>
              </div>
            )}

            {/* LEADS CARDS GRID */}
            {!loading && payload && payload.leads && payload.leads.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payload.leads.map((l) => (
                  <div key={l.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition space-y-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-3">
                      
                      {/* CATEGORY & LOCATION HEADER */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 flex items-center gap-1.5">
                          {getCategoryIcon(l.category)}
                          {l.category}
                        </span>
                        <span className="text-slate-400 font-mono flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> {l.location}
                        </span>
                      </div>

                      {/* BUSINESS NAME */}
                      <h3 className="text-lg font-bold text-white tracking-tight leading-snug">{l.businessName}</h3>

                      {/* SIGNAL & RECON DETAIL */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs font-mono">
                        <div className="text-rose-400 font-bold flex items-center justify-between">
                          <span>🚨 Signal: {l.signal}</span>
                          <a href={l.osmUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                            OSM Record <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {l.phone && l.phone !== 'N/A' && (
                          <div className="text-amber-300 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Contact Phone: {l.phone}
                          </div>
                        )}
                      </div>

                      {/* PROBLEM DESCRIPTION */}
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-400 font-mono">Problem / Growth Bottleneck:</div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{l.problemDescription}</p>
                      </div>

                      {/* HOW DEVIFY HELPS */}
                      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                        <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-emerald-400" /> How Devify Labs Can Help:
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{l.pitch}</p>
                      </div>

                    </div>

                    {/* ACTION FOOTER */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => copyPitch(l.pitch, l.id)}
                        className="text-xs text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-900 transition flex items-center gap-1.5 font-mono cursor-pointer"
                      >
                        {copiedId === l.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === l.id ? 'Copied Pitch!' : 'Copy Pitch'}
                      </button>

                      <a
                        href={l.osmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white font-mono flex items-center gap-1"
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: WEBSITE AUDITOR & PITCHER */}
        {activeTab === 'auditor' && (
          <div className="space-y-6">
            <div class="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white">Target Website Technical Auditor</h2>
              <p className="text-xs text-slate-400">Analyze any existing business website URL to scan load latency, viewport configuration, and security headers.</p>
              
              <div className="flex gap-3 max-w-xl">
                <input
                  type="text"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  placeholder="e.g. startupname.io or clientdomain.in"
                  className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={runAudit}
                  disabled={auditLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition text-xs font-mono cursor-pointer"
                >
                  {auditLoading ? 'Auditing...' : 'Run Audit'}
                </button>
              </div>
            </div>

            {auditResult && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="text-xs font-mono text-emerald-400 font-bold">Audit Results for {auditResult.domain || auditUrl}:</div>
                <pre className="p-4 rounded-xl bg-slate-950 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
                  {auditResult.emailPitch || auditResult.error || JSON.stringify(auditResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PITCH CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-xl font-bold text-white">Pitch & Proposal Customizer</h2>
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
                <div className="text-emerald-400 font-bold">White-Label Engineering Partner Pitch</div>
                <pre className="whitespace-pre-wrap leading-relaxed">
Hi Team,

At Devify Labs, we operate as a plug-and-play white-label engineering partner for design agencies and growing local businesses. We handle full-stack web app builds (React, Next.js, Webflow, Node, AI Assistants) under your brand.

⚡ Fast 10-14 Day Turnarounds
⚡ Responsive Code & Quality Guarantee
⚡ Per-project or Monthly Retainers

Do you have any upcoming builds where an extra dev team could help ease bandwidth?
                </pre>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        Devify Labs Client Acquisition Portal • Powered by OpenStreetMap Overpass API • {new Date().getFullYear()}
      </footer>

    </div>
  );
}
