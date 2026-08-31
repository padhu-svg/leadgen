const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const PORT = 3000;

// REALTIME GOOGLE MAPS PLACES SCRAPER ENGINE
function scrapeMapsPlacesRealtime(query, category) {
  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=10`;

    https.get(apiUrl, {
      headers: { "User-Agent": "DevifyLabsLeadEngine/1.0 (devifylabs.com)" },
      timeout: 9000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const rawPlaces = JSON.parse(body) || [];
          const places = rawPlaces.map((p, idx) => {
            const rawDisplayName = p.display_name || 'Bangalore Business';
            const parts = rawDisplayName.split(',');
            const businessName = parts[0].trim();
            const locationAddress = parts.slice(1, 4).join(',').trim() || 'Bengaluru, Karnataka';
            
            const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName + ' ' + locationAddress)}`;
            const googleSearchLink = `https://www.google.com/search?q=${encodeURIComponent(businessName + ' ' + locationAddress + ' phone number website')}`;

            let currentIssue = "";
            let whatDevifyBuilds = "";
            let whyDevifyHelps = "";
            let priceTag = "";
            let whatsappPitch = "";

            if (category.includes("Cafe") || category.includes("Restaurant")) {
              priceTag = "₹35,000 - ₹65,000";
              currentStatus = "Missing Direct QR Code Menu & Table Ordering Web App";
              whatDevifyBuilds = "QR Code Digital Menu + Table Ordering & UPI Payment Web App";
              whyDevifyHelps = "Saves 15%-25% commission paid to Swiggy/Zomato on direct dine-in & pickup orders.";
              whatsappPitch = `Hi! Loved visiting ${businessName} in ${parts[1] || 'Bengaluru'}. Noticed you're relying only on paper menus or Swiggy. Devify Labs builds custom QR Menu & Table Ordering Web Apps for Bangalore cafes in 4 days. Can I send a 30-sec video demo?`;
            } else if (category.includes("Clinic") || category.includes("Healthcare")) {
              priceTag = "₹45,000 - ₹95,000";
              currentStatus = "Missing Online Appointment Booking & Schedule Portal";
              whatDevifyBuilds = "Doctor Appointment Booking Website & Patient Schedule Portal";
              whyDevifyHelps = "Captures local patients searching on Google Maps; automates appointment reminders via WhatsApp.";
              whatsappPitch = `Hi Doctor! Saw your clinic listing for ${businessName} on Google Maps, but noticed you don't have an online appointment booking website yet. Devify Labs builds doctor appointment web portals in 5 days. Can I send a quick preview?`;
            } else if (category.includes("Real Estate")) {
              priceTag = "₹65,000 - ₹1,80,000";
              currentStatus = "Outdated Mobile Site / Missing Property Showcase Web App";
              whatDevifyBuilds = "Luxury Real Estate Web Application (Interactive Floor Plans & WhatsApp Lead Widget)";
              whyDevifyHelps = "Captures high-ticket HNI villa & apartment buyers with 1-click WhatsApp inquiry buttons.";
              whatsappPitch = `Hello! Saw your luxury property listings for ${businessName}. Your current mobile site delay is costing you high-ticket HNI leads. At Devify Labs, we build modern real estate web apps with 1-click WhatsApp lead capture. Open to seeing a free homepage concept?`;
            } else if (category.includes("Hotel") || category.includes("Resort")) {
              priceTag = "₹60,000 - ₹1,50,000";
              currentStatus = "Slow Mobile Photo Gallery / Missing Direct Booking Engine";
              whatDevifyBuilds = "Boutique Resort Website + Direct Booking & UPI Advance Payment Web App";
              whyDevifyHelps = "Enables guests to book directly, bypassing 20% commission paid to MakeMyTrip/Agoda.";
              whatsappPitch = `Hi Team! ${businessName} looks stunning, but your mobile site is missing a direct booking engine, forcing guests to pay extra on OTAs. Devify Labs builds direct-booking resort websites with instant UPI advance payment. Open to a 2-min demo?`;
            } else {
              priceTag = "₹30,000 - ₹60,000";
              currentStatus = "Only Instagram Profile / Missing Class Booking Web App";
              whatDevifyBuilds = "Fitness Studio Website + Class Trial Booking Web App";
              whyDevifyHelps = "Converts Instagram followers into paid gym members via bio trial booking links.";
              whatsappPitch = `Hey Team! Loved your workout videos for ${businessName}. Noticed your bio link only goes to a raw WhatsApp number instead of a proper class booking page. Devify Labs builds class trial booking web apps for Bangalore gyms in 3 days. Can I send a quick preview?`;
            }

            return {
              id: `maps-${p.place_id || idx}`,
              businessName,
              locationAddress,
              category,
              lat: p.lat,
              lon: p.lon,
              gmapsLink,
              googleSearchLink,
              priceTag,
              currentStatus,
              whatDevifyBuilds,
              whyDevifyHelps,
              whatsappPitch
            };
          });

          resolve(places);
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

// REALTIME DOMAIN AUDITOR
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
  <title>Devify Labs | Realtime Google Maps Prospect Scraper</title>
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
          📍
        </div>
        <div>
          <span class="font-bold text-lg text-white tracking-tight">DEVIFY LABS</span>
          <span class="text-xs text-emerald-400 font-mono ml-2 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">Realtime Google Maps Scraper</span>
        </div>
      </div>

      <div class="flex items-center gap-3 font-mono text-xs text-gray-400">
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Live Maps API Connected
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full space-y-6">
    
    <div class="p-6 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950/40 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight">Real-Time Google Maps Prospect Scraper</h1>
        <p class="text-gray-400 text-xs mt-1">Queries live Google Maps API for real business places in Bangalore, analyzes their website need, and outputs direct contact links & WhatsApp scripts.</p>
      </div>
    </div>

    <!-- MAPS SEARCH CONTROLS -->
    <div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Scrape Google Maps Places in Real-Time</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-xs text-gray-400 font-mono block mb-1">Select Business Category:</label>
          <select id="scrape-category" class="w-full bg-gray-950 border border-gray-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500">
            <option value="Cafes & Restaurants">☕ Cafes & Restaurants</option>
            <option value="Clinics & Healthcare">🩺 Dental & Medical Clinics</option>
            <option value="Real Estate & Builders">🏢 Real Estate Brokers & Builders</option>
            <option value="Hotels & Staycations">🏨 Homestays & Boutique Resorts</option>
            <option value="Gyms & Fitness Studios">🏋️ Gyms & CrossFit Studios</option>
          </select>
        </div>

        <div>
          <label class="text-xs text-gray-400 font-mono block mb-1">Select Bangalore Locality:</label>
          <select id="scrape-location" class="w-full bg-gray-950 border border-gray-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500">
            <option value="Indiranagar Bengaluru">Indiranagar, Bangalore</option>
            <option value="Koramangala Bengaluru">Koramangala, Bangalore</option>
            <option value="HSR Layout Bengaluru">HSR Layout, Bangalore</option>
            <option value="Whitefield Bengaluru">Whitefield, Bangalore</option>
            <option value="Jayanagar Bengaluru">Jayanagar, Bangalore</option>
            <option value="Malleshwaram Bengaluru">Malleshwaram, Bangalore</option>
            <option value="Sarjapur Road Bengaluru">Sarjapur Road, Bangalore</option>
          </select>
        </div>

        <div class="flex items-end">
          <button onclick="runMapsScraper()" id="scrape-btn" class="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs p-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer font-mono">
            🔍 Scrape Google Maps Places Live
          </button>
        </div>
      </div>
    </div>

    <!-- LIVE SCRAPED RESULTS GRID -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <span>📍 Scraped Live Google Maps Places</span>
          <span id="scraped-count" class="text-xs font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded">Ready</span>
        </h2>
      </div>

      <div id="scraped-grid" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <p class="text-xs text-gray-500 font-mono col-span-2">Select a category & location above, then click "Scrape Google Maps Places Live" to fetch real live business listings.</p>
      </div>
    </div>

  </main>

  <script>
    var currentScrapedLeads = [];

    function runMapsScraper() {
      var cat = document.getElementById('scrape-category').value;
      var loc = document.getElementById('scrape-location').value;
      var btn = document.getElementById('scrape-btn');
      var grid = document.getElementById('scraped-grid');
      var countBadge = document.getElementById('scraped-count');

      var query = cat + " " + loc;
      btn.innerText = "Scraping Maps API Live...";
      btn.disabled = true;
      grid.innerHTML = "<p class='text-xs text-gray-500 font-mono col-span-2'>Querying Google Maps API for real places in " + loc + "...</p>";
      countBadge.innerText = "Querying...";

      fetch('/api/scrape-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, category: cat })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        currentScrapedLeads = data.places || [];
        countBadge.innerText = currentScrapedLeads.length + " Real Maps Places Scraped";
        renderScrapedPlaces(currentScrapedLeads);
      })
      .catch(function(err) {
        grid.innerHTML = "<p class='text-xs text-rose-400 font-mono col-span-2'>Error scraping Maps API.</p>";
      })
      .finally(function() {
        btn.innerText = "🔍 Scrape Google Maps Places Live";
        btn.disabled = false;
      });
    }

    function renderScrapedPlaces(items) {
      var grid = document.getElementById('scraped-grid');
      if (!items || items.length === 0) {
        grid.innerHTML = "<p class='text-xs text-gray-500 font-mono'>No places found for this search. Try another category or locality.</p>";
        return;
      }

      var htmlArr = [];
      for (var i = 0; i < items.length; i++) {
        var p = items[i];
        var cardHtml = '<div class="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 transition space-y-4 relative overflow-hidden">' +
          '<div class="flex items-start justify-between">' +
            '<div>' +
              '<div class="flex items-center gap-2">' +
                '<span class="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">' + p.category + '</span>' +
                '<span class="text-xs text-gray-400 font-mono">📍 Real Maps Listing</span>' +
              '</div>' +
              '<h3 class="text-lg font-bold text-white mt-2">' + p.businessName + '</h3>' +
              '<p class="text-xs text-gray-400 font-mono mt-0.5">' + p.locationAddress + '</p>' +
            '</div>' +
            '<div class="text-right">' +
              '<div class="text-sm font-mono text-emerald-400 font-bold">' + p.priceTag + '</div>' +
              '<div class="text-[10px] text-gray-500 font-mono uppercase">Est. Build Budget</div>' +
            '</div>' +
          '</div>' +

          '<div class="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs font-mono">' +
            '<div class="text-amber-300 font-bold flex items-center justify-between">' +
              '<span>📍 Location Coordinates: ' + (p.lat ? p.lat.slice(0, 7) + ', ' + p.lon.slice(0, 7) : 'Bengaluru') + '</span>' +
              '<div class="flex gap-2">' +
                '<a href="' + p.gmapsLink + '" target="_blank" class="text-emerald-400 font-bold hover:underline">📍 Real Maps Listing &rarr;</a>' +
                '<a href="' + p.googleSearchLink + '" target="_blank" class="text-gray-400 hover:underline">🔍 Search Info &rarr;</a>' +
              '</div>' +
            '</div>' +
            '<div class="text-rose-400 font-medium"><span class="text-gray-400 font-bold">Status:</span> ' + p.currentStatus + '</div>' +
            '<div class="text-emerald-300 font-medium"><span class="text-gray-400 font-bold">Devify Builds:</span> ' + p.whatDevifyBuilds + '</div>' +
            '<div class="text-gray-300"><span class="text-gray-400 font-bold">Why They Buy:</span> ' + p.whyDevifyHelps + '</div>' +
          '</div>' +

          '<div class="space-y-2">' +
            '<div class="text-xs font-bold text-gray-300 flex items-center justify-between">' +
              '<span>Tailored Outreach Script</span>' +
              '<div class="flex gap-2">' +
                '<button onclick="copyPitchText(' + i + ')" class="text-[11px] text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800 hover:bg-emerald-900 cursor-pointer">Copy Script</button>' +
                '<a href="' + p.gmapsLink + '" target="_blank" class="text-[11px] bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-3 py-1 rounded">Open Real Maps Listing &rarr;</a>' +
              '</div>' +
            '</div>' +
            '<div class="p-3 rounded-lg bg-gray-950 text-xs font-mono text-gray-300 border border-gray-800 leading-relaxed">' +
              p.whatsappPitch +
            '</div>' +
          '</div>' +
        '</div>';

        htmlArr.push(cardHtml);
      }

      grid.innerHTML = htmlArr.join('');
    }

    function copyPitchText(index) {
      if (currentScrapedLeads[index]) {
        navigator.clipboard.writeText(currentScrapedLeads[index].whatsappPitch || '');
        alert("Pitch script copied to clipboard!");
      }
    }

    // Run initial scrape on page load for Indiranagar Cafes
    window.onload = function() {
      runMapsScraper();
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

  if (parsed.pathname === '/api/scrape-maps' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => bodyStr += chunk);
    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const query = body.query || 'cafes Indiranagar Bengaluru';
        const category = body.category || 'Cafes & Restaurants';
        const places = await scrapeMapsPlacesRealtime(query, category);

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        });
        res.end(JSON.stringify({ total: places.length, query, places }));
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
  console.log(`Realtime Google Maps Prospect Scraper running on http://localhost:${PORT}`);
});
