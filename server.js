const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const PORT = 3000;

// 1. FETCH REAL LIVE COMPANIES HIRING CONTRACT DEVELOPERS (LIVE API)
function fetchRealLiveCompaniesHiring() {
  return new Promise((resolve) => {
    const apiUrl = "https://remoteok.com/api";
    https.get(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DevifyBot/1.0" },
      timeout: 8000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const rawJobs = Array.isArray(data) ? data.slice(1, 15) : [];
          const realLeads = rawJobs.map((j, idx) => {
            const company = j.company || 'Tech Company';
            const position = j.position || 'Web Developer';
            const location = j.location || 'Remote / Worldwide';
            const jobUrl = j.url || `https://remoteok.com`;
            const tags = (j.tags || []).slice(0, 4).join(', ');

            return {
              id: `real-job-${j.id || idx}`,
              type: "REAL LIVE COMPANY HIRING",
              companyName: company,
              title: `${position} needed at ${company}`,
              location: location,
              sourceUrl: jobUrl,
              tags: tags || "Web Development, React, Full-Stack",
              currentIssue: "Active hiring backlog; full-time recruitment takes 60+ days.",
              whatDevifyBuilds: "Plug-and-play full-stack React/Next.js/Node engineering team to start shipping code immediately.",
              whyDevifyHelps: `Devify Labs bypasses the 2-month hiring delay for ${company} by supplying senior web developers on demand.`,
              whatsappPitch: `Hi ${company} Team! Saw your active opening for ${position}. Rather than waiting 2 months to hire & onboard full-time, Devify Labs can start shipping your web backlog this Monday. Open to a brief 5-min call?`
            };
          });
          resolve(realLeads);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

// 2. FETCH REAL LIVE BANGALORE FOUNDERS & TECH STUDIOS (GITHUB LIVE API)
function fetchRealBangaloreTechFounders() {
  return new Promise((resolve) => {
    const apiUrl = "https://api.github.com/search/users?q=location:Bengaluru+followers:>10";
    https.get(apiUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DevifyBot/1.0" },
      timeout: 8000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          const items = (data.items || []).slice(0, 10).map((u, idx) => {
            const username = u.login;
            const profileUrl = u.html_url;

            return {
              id: `real-blr-${u.id || idx}`,
              type: "REAL BANGALORE TECH FOUNDER / STUDIO",
              companyName: `${username} (Bengaluru Tech Profile)`,
              title: `Live Bengaluru GitHub Founder Profile: ${username}`,
              location: "Bengaluru, Karnataka, India",
              sourceUrl: profileUrl,
              tags: "Bengaluru Tech, Open-Source, Software",
              currentIssue: "Building or scaling web projects; requires high-converting landing pages & app UI.",
              whatDevifyBuilds: "Silicon-Valley-grade Web Application UI & Next.js Landing Page Redesign.",
              whyDevifyHelps: "Devify Labs helps Bangalore tech founders turn raw code repositories into investor-ready web products.",
              whatsappPitch: `Hi ${username}! Came across your open-source projects on GitHub in Bengaluru. At Devify Labs, we build modern Next.js web applications and pitch-ready UIs for Bangalore tech founders. Open to seeing a quick demo?`
            };
          });
          resolve(items);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

// 3. REALTIME DOMAIN AUDITOR (REAL HTTP SCANS)
function auditRealDomain(targetUrl) {
  return new Promise((resolve) => {
    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    let parsed;
    try { parsed = url.parse(formattedUrl); }
    catch(e) { return resolve({ error: "Invalid URL provided" }); }

    const client = parsed.protocol === 'https:' ? https : http;
    const domain = parsed.hostname || targetUrl;
    const startTime = Date.now();

    const req = client.get(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000,
      rejectUnauthorized: false
    }, (res) => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        const latency = Date.now() - startTime;
        let healthScore = 100;
        const issues = [];
        const detectedTech = [];

        if (latency > 2500) {
          healthScore -= 25;
          issues.push(`Slow server response time (${latency}ms > 2500ms benchmark)`);
        } else if (latency > 1200) {
          healthScore -= 15;
          issues.push(`Moderate initial server load delay (${latency}ms)`);
        }

        const htmlLower = html.toLowerCase();
        if (!htmlLower.includes('name="viewport"') && !htmlLower.includes("name='viewport'")) {
          healthScore -= 25;
          issues.push("Missing Mobile Viewport Tag (Not optimized for smartphones)");
        }

        if (!htmlLower.includes('property="og:') && !htmlLower.includes("property='og:")) {
          healthScore -= 15;
          issues.push("Missing OpenGraph social card tags (Previews look broken when shared)");
        }

        if (!res.headers['strict-transport-security']) {
          issues.push("Missing HSTS Security Header");
        }

        if (html.includes("__NEXT_DATA__") || html.includes("_next/static")) detectedTech.push("Next.js");
        if (html.includes("react-root") || html.includes("data-reactid")) detectedTech.push("React");
        if (html.includes("cdn.shopify.com")) detectedTech.push("Shopify");
        if (html.includes("wp-content")) detectedTech.push("WordPress");
        if (html.includes("uploads-ssl.webflow.com")) detectedTech.push("Webflow");
        if (html.includes("jquery.min.js")) detectedTech.push("jQuery (Legacy)");

        healthScore = Math.max(15, Math.min(100, healthScore));
        const companyName = domain.replace('www.', '').split('.')[0].toUpperCase();

        resolve({
          domain,
          url: formattedUrl,
          companyName,
          healthScore,
          latency,
          statusCode: res.statusCode,
          detectedTech,
          issues,
          emailPitch: `Hi ${companyName} Team,\n\nI ran a live performance audit on ${domain} and noticed a few quick friction points:\n\n` +
            (issues.map(i => `• ${i}`).join('\n') || '• Mobile responsive layout tuning needed') +
            `\n\nRealtime Health Score: ${healthScore}/100 | Measured Latency: ${latency}ms\nDetected Tech Stack: ${detectedTech.join(', ') || 'Custom Stack'}\n\nAt Devify Labs, we help companies build high-performance web applications and sleek landing pages in 10-14 days.\n\nWould you be open to a 10-minute chat this week to review the findings?\n\nBest regards,\nPradhyumna Maiya\nFounder, Devify Labs | devifylabs.com`,
          whatsappPitch: `Hi ${companyName} team, Pradhyumna from Devify Labs here. Checked ${domain} on mobile—noticed server latency is ${latency}ms. At Devify Labs, we build fast, modern web apps for growing companies. Open to a 2-min chat?`
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        domain,
        url: formattedUrl,
        error: `Connection Failed: ${err.message}`,
        healthScore: 0,
        latency: 0,
        issues: [`Site unreachable or connection timed out (${err.message})`],
        emailPitch: `Hi Team,\n\nTried visiting ${domain} and noticed the site timed out.\n\nAt Devify Labs, we help companies deploy reliable web infrastructure. Open to a quick call to get this fixed?`,
        whatsappPitch: `Hi Team, noticed ${domain} is currently down. Devify Labs can help restore zero-downtime hosting today!`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ error: "Request timed out" });
    });
  });
}

function getHtmlDashboard() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Devify Labs | Real-Time Live Client Discovery Engine</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #030712; color: #f3f4f6; }
  </style>
</head>
<body class="min-h-screen flex flex-col font-sans antialiased">
  
  <header class="border-b border-gray-800 bg-gray-900/90 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-gray-950">
          ⚡
        </div>
        <div>
          <span class="font-bold text-lg text-white tracking-tight">DEVIFY LABS</span>
          <span class="text-xs text-emerald-400 font-mono ml-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">Real-Time Live Client Engine</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button onclick="loadRealtimeLeads()" class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs px-4 py-2 rounded-lg transition font-mono cursor-pointer flex items-center gap-1.5">
          🔄 Fetch Live Real-Time Clients
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full space-y-6">
    
    <div class="p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950/40 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight">Real-Time Live Client Discovery Engine</h1>
        <p class="text-gray-400 text-xs mt-1">100% Real Live Companies hiring developers & Bangalore tech founders fetched directly from public APIs in real time.</p>
      </div>

      <div class="flex items-center gap-2 text-xs font-mono">
        <span id="live-status-badge" class="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg">
          Live Endpoint Connected
        </span>
      </div>
    </div>

    <!-- LIVE WEBSITE AUDITOR BOX -->
    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
      <h2 class="text-lg font-bold text-white">Inspect Any Target Company Domain Live</h2>
      <div class="flex gap-3 max-w-xl">
        <input type="text" id="target-url" placeholder="e.g. companyname.com or startupname.io" class="flex-grow bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500">
        <button onclick="runAudit()" id="audit-btn" class="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs px-5 py-2.5 rounded-xl transition">
          Run Live Audit
        </button>
      </div>

      <div id="audit-output" class="hidden p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
        <div class="flex items-center justify-between text-xs font-mono">
          <span id="aud-domain" class="text-emerald-400 font-bold"></span>
          <span id="aud-score" class="text-gray-300"></span>
        </div>
        <pre id="aud-pitch" class="p-3 rounded bg-gray-900 text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed"></pre>
      </div>
    </div>

    <!-- LIVE LEADS GRID -->
    <div class="space-y-4">
      <h2 class="text-lg font-bold text-white flex items-center gap-2">
        <span>📡 Live Active Client Opportunities</span>
        <span id="lead-count" class="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">Loading...</span>
      </h2>

      <div id="leads-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <p class="text-xs text-gray-500 font-mono col-span-2">Connecting to live APIs...</p>
      </div>
    </div>

  </main>

  <script>
    var currentRealLeads = [];

    function loadRealtimeLeads() {
      var grid = document.getElementById('leads-grid');
      var badge = document.getElementById('lead-count');
      grid.innerHTML = "<p class='text-xs text-gray-500 font-mono col-span-2'>Fetching real-time live data from APIs...</p>";
      badge.innerText = "Fetching...";

      fetch('/api/realtime-clients')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          currentRealLeads = data.leads || [];
          badge.innerText = currentRealLeads.length + " Real Live Companies Found";
          renderRealLeads(currentRealLeads);
        })
        .catch(function(err) {
          grid.innerHTML = "<p class='text-xs text-rose-400 font-mono col-span-2'>Error connecting to live APIs.</p>";
        });
    }

    function renderRealLeads(items) {
      var grid = document.getElementById('leads-grid');
      if (!items || items.length === 0) {
        grid.innerHTML = "<p class='text-xs text-gray-500 font-mono'>No live client leads found.</p>";
        return;
      }

      var htmlArr = [];
      for (var i = 0; i < items.length; i++) {
        var l = items[i];
        var encodedPitch = encodeURIComponent(l.whatsappPitch || '');

        var cardHtml = '<div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 transition space-y-4 relative overflow-hidden">' +
          '<div class="flex items-start justify-between">' +
            '<div>' +
              '<div class="flex items-center gap-2">' +
                '<span class="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">' + l.type + '</span>' +
                '<span class="text-xs text-gray-400 font-mono">📍 ' + l.location + '</span>' +
              '</div>' +
              '<h3 class="text-lg font-bold text-white mt-2">' + l.title + '</h3>' +
            '</div>' +
          '</div>' +

          '<div class="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs font-mono">' +
            '<div class="text-gray-400"><span class="text-emerald-400 font-bold">Tags / Industry:</span> ' + l.tags + '</div>' +
            '<div class="text-rose-400 font-medium"><span class="text-gray-400 font-bold">Client Need:</span> ' + l.currentStatus + '</div>' +
            '<div class="text-emerald-300 font-medium"><span class="text-gray-400 font-bold">Devify Builds:</span> ' + l.whatDevifyBuilds + '</div>' +
            '<div class="text-gray-300"><span class="text-gray-400 font-bold">Why Devify Helps:</span> ' + l.whyDevifyHelps + '</div>' +
          '</div>' +

          '<div class="space-y-2">' +
            '<div class="text-xs font-bold text-gray-300 flex items-center justify-between">' +
              '<span>Tailored Outreach Pitch</span>' +
              '<div class="flex gap-2">' +
                '<button onclick="copyPitchText(' + i + ')" class="text-[11px] text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 hover:bg-emerald-900 cursor-pointer">Copy Pitch</button>' +
                '<a href="' + l.sourceUrl + '" target="_blank" class="text-[11px] bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-3 py-1 rounded">View Live Source Listing &rarr;</a>' +
              '</div>' +
            '</div>' +
            '<div class="p-3 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 leading-relaxed">' +
              l.whatsappPitch +
            '</div>' +
          '</div>' +
        '</div>';

        htmlArr.push(cardHtml);
      }

      grid.innerHTML = htmlArr.join('');
    }

    function copyPitchText(index) {
      if (currentRealLeads[index]) {
        navigator.clipboard.writeText(currentRealLeads[index].whatsappPitch || '');
        alert("Pitch script copied to clipboard!");
      }
    }

    function runAudit() {
      var target = document.getElementById('target-url').value;
      if (!target) return;
      var btn = document.getElementById('audit-btn');
      btn.innerText = "Scanning Live...";
      btn.disabled = true;

      fetch('/api/audit-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: target })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        document.getElementById('aud-domain').innerText = "Target: " + data.domain;
        document.getElementById('aud-score').innerText = "Health Score: " + data.healthScore + "/100 | Latency: " + data.latency + "ms";
        document.getElementById('aud-pitch').innerText = data.emailPitch;
        document.getElementById('audit-output').classList.remove('hidden');
      })
      .finally(function() {
        btn.innerText = "Run Live Audit";
        btn.disabled = false;
      });
    }

    window.onload = function() {
      loadRealtimeLeads();
    };
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHtmlDashboard());
    return;
  }

  if (parsed.pathname === '/api/realtime-clients' && req.method === 'GET') {
    try {
      const liveJobs = await fetchRealLiveCompaniesHiring();
      const blrFounders = await fetchRealBangaloreTechFounders();
      const combined = [...liveJobs, ...blrFounders];

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      });
      res.end(JSON.stringify({ total: combined.length, leads: combined }));
    } catch(e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (parsed.pathname === '/api/audit-live' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const target = body.url ? body.url.trim() : 'example.com';
        const result = await auditRealDomain(target);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch(e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Real Live Client Discovery Engine running on http://localhost:${PORT}`);
});
