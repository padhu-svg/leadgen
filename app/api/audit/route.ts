import { NextResponse } from 'next/server';

const TECH_SIGNATURES: Record<string, string[]> = {
  "Next.js": ["__NEXT_DATA__", "_next/static", "_next/data"],
  "React": ["react-root", "_reactListening", "data-reactid"],
  "Vue.js": ["data-v-", "vue.global.js", "vue.runtime"],
  "Angular": ["ng-version", "ng-app"],
  "Shopify": ["cdn.shopify.com", "Shopify.theme"],
  "WordPress": ["wp-content", "wp-includes"],
  "Webflow": ["uploads-ssl.webflow.com", "webflow.js"],
  "Tailwind CSS": ["tailwindcss", "bg-", "text-", "flex", "grid"],
  "Bootstrap": ["bootstrap.min.css", "bootstrap.bundle.js"],
  "jQuery": ["jquery.min.js", "jquery-3."]
};

const SECURITY_HEADERS = [
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Content-Security-Policy"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let url = body.url ? body.url.trim() : "";
    
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const domain = new URL(url).hostname || url;
    const companyName = domain
      .replace("www.", "")
      .replace(/\.(com|org|io|co|dev|net|app|in)$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const startTime = Date.now();
    let resp: Response;
    try {
      resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000)
      });
    } catch (e) {
      return NextResponse.json({
        domain,
        url,
        healthScore: 0,
        responseTimeMs: 0,
        detectedTech: [],
        issues: [`Connection Failed or Timed Out: ${String(e)}`],
        companyName,
        emailSubject: `Quick UX & performance feedback for ${domain}`,
        emailBody: `Hi ${companyName} Team,\n\nI tried accessing ${domain} and noticed the site timed out or failed to connect.\n\nAt Devify Labs, we help companies build reliable, fast digital web apps. Would love to help you get this fixed!\n\nBest,\nPradhyumna Maiya\nDevify Labs | devifylabs.com`,
        loomScript: `Hey ${companyName} team, Pradhyumna here from Devify Labs. I noticed ${domain} is currently experiencing uptime or loading issues...`,
        markdownReport: `# Audit Report for ${domain}\n\n- **Status:** Offline / Connection Timeout`
      });
    }

    const responseTimeMs = Date.now() - startTime;
    const html = await resp.text();
    let healthScore = 100;
    const issues: string[] = [];
    const detectedTech: string[] = [];

    // Latency Check
    if (responseTimeMs > 2500) {
      healthScore -= 20;
      issues.push(`Slow response time (${responseTimeMs}ms > 2500ms)`);
    } else if (responseTimeMs > 1200) {
      healthScore -= 10;
      issues.push(`Moderate response delay (${responseTimeMs}ms)`);
    }

    // Security Headers Check
    const missingHeaders: string[] = [];
    SECURITY_HEADERS.forEach((header) => {
      if (!resp.headers.get(header.toLowerCase())) {
        missingHeaders.push(header);
      }
    });

    if (missingHeaders.length > 2) {
      healthScore -= 10;
      issues.push(`Missing key security headers (${missingHeaders.slice(0, 2).join(', ')})`);
    }

    // DOM & Meta Inspection
    const hasViewport = html.toLowerCase().includes('name="viewport"') || html.toLowerCase().includes("name='viewport'");
    if (!hasViewport) {
      healthScore -= 25;
      issues.push("Missing Mobile Viewport meta tag (Not optimized for mobile screens)");
    }

    const hasOG = html.toLowerCase().includes('property="og:') || html.toLowerCase().includes("property='og:");
    if (!hasOG) {
      healthScore -= 10;
      issues.push("Missing OpenGraph social card meta tags (Poor preview on Twitter & LinkedIn)");
    }

    // Tech Stack Detection
    Object.entries(TECH_SIGNATURES).forEach(([tech, sigs]) => {
      if (sigs.some((sig) => html.includes(sig))) {
        detectedTech.push(tech);
      }
    });

    if (detectedTech.includes("jQuery") && !detectedTech.includes("React") && !detectedTech.includes("Next.js")) {
      healthScore -= 10;
      issues.push("Built with legacy jQuery front-end (Ideal candidate for modern React/Next.js upgrade)");
    }

    healthScore = Math.max(10, Math.min(100, healthScore));
    const topIssues = issues.slice(0, 3);
    const formattedIssuesList = topIssues.map((i) => `• ${i}`).join("\n");
    const techStr = detectedTech.length > 0 ? detectedTech.join(", ") : "Standard Web Stack";

    const emailSubject = `Quick UX & performance feedback for ${domain}`;
    const emailBody = `Hi ${companyName} Team,

I was checking out ${domain} and noticed a few quick friction points that might be hurting your user conversion rates:

${formattedIssuesList || '• Mobile responsive layout tuning needed'}

Current Health Score: ${healthScore}/100 (Response time: ${responseTimeMs}ms)
Detected Tech Stack: ${techStr}

At Devify Labs, we specialize in high-performance web app design and fast full-stack development. We help growing products upgrade their digital experience and boost conversions in weeks.

I recorded a 60-second Loom showing exactly how we'd fix these issues for ${companyName}: [Insert Loom Video Link]

Would you be open to a 10-minute chat this week to review the audit?

Best regards,
Pradhyumna Maiya
Founder, Devify Labs | devifylabs.com`;

    const loomScript = `--- 60-SECOND LOOM SCRIPT FOR ${domain.toUpperCase()} ---

[0:00 - 0:15] INTRO:
"Hey ${companyName} team, Pradhyumna here from Devify Labs. I was on your website ${domain} today and really love your product. I noticed a couple of quick speed and UX opportunities that could help boost signups."

[0:15 - 0:45] SHOWING THE ISSUES:
"First: ${topIssues[0] || 'Mobile viewport scaling needs optimization'}.
Second: ${topIssues[1] || 'Initial server latency is sitting at ' + responseTimeMs + 'ms'}.
Third: ${topIssues[2] || 'Social preview cards are missing for Twitter and LinkedIn'}."

[0:45 - 1:00] THE CALL TO ACTION:
"We can help you redesign and optimize this whole workflow in under 10 days at Devify Labs. Check out devifylabs.com or reply to my email if you'd like us to handle this!"`;

    const markdownReport = `# Technical & UX Audit Report for ${domain}

**Generated by Devify Labs Lead Engine**

---

### Executive Overview
- **Target Domain:** \`${domain}\`
- **Health Score:** \`${healthScore} / 100\`
- **Server Latency:** \`${responseTimeMs} ms\`
- **Detected Stack:** \`${techStr}\`

### Key Audit Findings
${formattedIssuesList}

### Recommended Actions
1. **Speed Optimization:** Reduce initial load time under 500ms.
2. **Mobile UX:** Upgrade responsive layouts for mobile checkout and signups.
3. **SEO Metadata:** Implement OpenGraph social card previews.
`;

    return NextResponse.json({
      domain,
      url,
      companyName,
      healthScore,
      responseTimeMs,
      detectedTech,
      issues,
      emailSubject,
      emailBody,
      loomScript,
      markdownReport,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
