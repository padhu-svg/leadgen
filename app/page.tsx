'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Check, 
  Copy, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Code2, 
  Video, 
  Mail, 
  FileText, 
  ExternalLink,
  Layers,
  ArrowRight,
  RefreshCw,
  Terminal
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'audit' | 'leads' | 'templates'>('audit');
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Leads state
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Pitch template variables
  const [pitchCompany, setPitchCompany] = useState('Acme Corp');
  const [pitchIndustry, setPitchIndustry] = useState('SaaS');

  const runAudit = async (domainToAudit?: string) => {
    const url = domainToAudit || targetUrl;
    if (!url) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) {
        setAuditResult(data);
      } else {
        setErrorMsg(data.error || 'Failed to run website audit.');
      }
    } catch (err) {
      setErrorMsg('Network error while running audit.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DEVIFY LABS
              </span>
              <span className="text-xs text-emerald-400 font-mono ml-2.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/50">
                Client Portal v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Vercel Deployment Ready
            </span>
          </div>
        </div>
      </header>

      {/* SUB-HEADER NAVIGATION TABS */}
      <div className="border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3.5 px-5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Website Auditor & Pitcher
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 px-5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            Live Client Opportunities ({leads.length})
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`py-3.5 px-5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pitch & Proposal Customizer
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">

        {/* TAB 1: WEBSITE AUDITOR */}
        {activeTab === 'audit' && (
          <div className="space-y-8">
            
            {/* HERO INPUT CARD */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Audit Prospect Website & Generate Cold Pitch
                </h1>
                <p className="text-slate-400 text-sm mb-6">
                  Enter any startup, e-commerce, or client website domain. Devify Engine will inspect load latency, mobile UX, security headers, metadata, and auto-write a personalized pitch package.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runAudit();
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-grow">
                    <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. example.com or startupname.io"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !targetUrl.trim()}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-6 py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Auditing...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Run Audit
                      </>
                    )}
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-rose-400 text-xs mt-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> {errorMsg}
                  </p>
                )}
              </div>
            </div>

            {/* AUDIT RESULTS DISPLAY */}
            {auditResult && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* METRIC OVERVIEW CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* HEALTH SCORE CARD */}
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Health Score</span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className={`text-4xl font-extrabold ${
                        auditResult.healthScore >= 80 ? 'text-emerald-400' :
                        auditResult.healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {auditResult.healthScore}
                      </span>
                      <span className="text-slate-500 font-medium text-sm">/ 100</span>
                    </div>
                  </div>

                  {/* LATENCY CARD */}
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Response Latency</span>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-white">{auditResult.responseTimeMs}</span>
                      <span className="text-slate-400 text-xs font-mono">ms</span>
                    </div>
                  </div>

                  {/* DOMAIN & TECH STACK CARD */}
                  <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 md:col-span-2 flex flex-col justify-between">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Target & Tech Stack</span>
                    <div className="mt-2 space-y-1.5">
                      <div className="text-sm font-semibold text-white truncate">{auditResult.domain}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {auditResult.detectedTech && auditResult.detectedTech.length > 0 ? (
                          auditResult.detectedTech.map((tech: string, i: number) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">Custom Web Stack Detected</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* ISSUES & GENERATED PITCH GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* COLUMN 1: ISSUES FOUND */}
                  <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Detected Friction Points ({auditResult.issues.length})
                    </h3>

                    <ul className="space-y-2.5">
                      {auditResult.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* COLUMN 2 & 3: GENERATED COLD EMAIL & LOOM SCRIPT */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* COLD EMAIL COPY CARD */}
                    <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-400" />
                          Generated Cold Email Pitch
                        </h3>
                        <button
                          onClick={() => copyToClipboard(`Subject: ${auditResult.emailSubject}\n\n${auditResult.emailBody}`, 'email')}
                          className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                        >
                          {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey === 'email' ? 'Copied!' : 'Copy Email'}
                        </button>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        <span className="text-slate-500 font-bold">Subject:</span> {auditResult.emailSubject}
                        {"\n\n"}
                        {auditResult.emailBody}
                      </div>
                    </div>

                    {/* LOOM VIDEO SCRIPT CARD */}
                    <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Video className="w-4 h-4 text-purple-400" />
                          60-Second Loom Teardown Script
                        </h3>
                        <button
                          onClick={() => copyToClipboard(auditResult.loomScript, 'loom')}
                          className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                        >
                          {copiedKey === 'loom' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedKey === 'loom' ? 'Copied!' : 'Copy Script'}
                        </button>
                      </div>

                      <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 font-mono text-xs text-purple-200 whitespace-pre-wrap leading-relaxed">
                        {auditResult.loomScript}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* TAB 2: LIVE OPPORTUNITIES */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Live Client Opportunities</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Scraped real-time hiring posts from Reddit r/forhire, HackerNews, and Product Hunt daily launches.
                </p>
              </div>

              <button
                onClick={fetchLeads}
                disabled={leadsLoading}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${leadsLoading ? 'animate-spin' : ''}`} />
                Refresh Feed
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leads.map((lead) => (
                <div key={lead.id} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/40">
                        {lead.source}
                      </span>
                      <span className="text-slate-500 font-medium">{lead.type}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-3">
                      {lead.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
                    >
                      View Source Post <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => {
                        setActiveTab('audit');
                        // Extract domain if present
                        setTargetUrl(lead.url);
                      }}
                      className="text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      Audit Target <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PITCH CUSTOMIZER */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Devify Pitch & Proposal Customizer</h2>
              <p className="text-slate-400 text-xs mt-1">
                Generate high-converting proposal and cold email templates for startups, agencies, and e-commerce brands.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* VARIABLE CONTROL PANEL */}
              <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Template Settings</h3>
                
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Client Company Name</label>
                  <input
                    type="text"
                    value={pitchCompany}
                    onChange={(e) => setPitchCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Industry / Niche</label>
                  <input
                    type="text"
                    value={pitchIndustry}
                    onChange={(e) => setPitchIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* TEMPLATE DISPLAY */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* AGENCY WHITE LABEL TEMPLATE */}
                <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-emerald-400">White-Label Agency Partnership Pitch</h4>
                    <button
                      onClick={() => copyToClipboard(`Subject: White-label development support for ${pitchCompany}\n\nHi team,\n\nBig fan of ${pitchCompany}'s recent client work in ${pitchIndustry}.\n\nAt Devify Labs, we operate as a plug-and-play white-label engineering team for design and marketing agencies. We handle complete full-stack builds (React, Next.js, Webflow, Node) under your brand.\n\n⚡ Fast turnarounds\n⚡ Clean code & responsive design\n⚡ Flexible retainers or per-project pricing\n\nDo you have any upcoming client builds where an extra dev hand could help ease workload?`, 'templ-agency')}
                      className="text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      {copiedKey === 'templ-agency' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Pitch
                    </button>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-850">
                    <span className="text-slate-500 font-bold">Subject:</span> White-label development support for {pitchCompany}
                    {"\n\n"}
                    Hi team,{"\n\n"}
                    Big fan of {pitchCompany}&apos;s recent client work in {pitchIndustry}.{"\n\n"}
                    At Devify Labs, we operate as a plug-and-play white-label engineering team for design and marketing agencies. We handle complete full-stack builds (React, Next.js, Webflow, Node) under your brand.{"\n\n"}
                    ⚡ Fast turnarounds{"\n"}
                    ⚡ Clean code &amp; responsive design{"\n"}
                    ⚡ Flexible retainers or per-project pricing{"\n\n"}
                    Do you have any upcoming client builds where an extra dev hand could help ease workload?
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Devify Labs Lead Engine • Built for Vercel Deployment • {new Date().getFullYear()}
      </footer>

    </div>
  );
}
