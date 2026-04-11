const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, LevelFormat, PageBreak, PageNumber, ExternalHyperlink } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "1B3A5C", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })]
  });
}

function cell(text, width, opts = {}) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20, bold: opts.bold, color: opts.color })] })]
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22, color: "1B3A5C" })] });
}

function para(text, opts = {}) {
  return new Paragraph({ spacing: { after: 150 }, alignment: opts.align,
    children: [new TextRun({ text, font: "Arial", size: 21, color: opts.color || "333333", bold: opts.bold, italics: opts.italics })] });
}

function bullet(text, ref = "bullets") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 21, color: "333333" })] });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1B3A5C" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "1B3A5C" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "1B3A5C" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "MedCart Kenya \u2014 DataForSEO Strategy Plan", font: "Arial", size: 16, color: "999999", italics: true })] })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Confidential \u2014 Page ", font: "Arial", size: 16, color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" })] })] })
    },
    children: [
      // ==================== COVER PAGE ====================
      new Paragraph({ spacing: { before: 2400 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
        children: [new TextRun({ text: "MEDCART KENYA", font: "Arial", size: 44, bold: true, color: "00A651" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
        children: [new TextRun({ text: "DataForSEO Integration Strategy Plan", font: "Arial", size: 32, color: "1B3A5C" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: "00A651", space: 12 } },
        children: [new TextRun({ text: "Leveraging DataForSEO APIs for SEO Intelligence,", font: "Arial", size: 22, color: "555555" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
        children: [new TextRun({ text: "Keyword Research, Competitor Analysis & Content Strategy", font: "Arial", size: 22, color: "555555" })] }),
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Prepared for: MedCart Kenya E-Commerce Team", font: "Arial", size: 20, color: "777777" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Date: April 2026", font: "Arial", size: 20, color: "777777" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Version: 1.0", font: "Arial", size: 20, color: "777777" })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== TABLE OF CONTENTS ====================
      heading("Table of Contents"),
      para("1. Executive Summary"),
      para("2. DataForSEO Overview & API Products"),
      para("3. Strategic Use Cases for MedCart Kenya"),
      para("4. Implementation Roadmap"),
      para("5. API Integration Architecture"),
      para("6. Budget Estimation"),
      para("7. KPIs & Success Metrics"),
      para("8. Risk Assessment"),
      para("9. Next Steps"),
      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 1. EXECUTIVE SUMMARY ====================
      heading("1. Executive Summary"),
      para("MedCart Kenya operates an online pharmacy e-commerce platform with 8,800+ health products sourced from MyDawa and Goodlife Pharmacy. To accelerate organic growth and outperform competitors in the Kenyan online pharmacy market, we propose integrating DataForSEO APIs into our digital marketing stack."),
      para("DataForSEO provides pay-per-use APIs covering SERP tracking, keyword research, competitor analysis, backlink monitoring, on-page auditing, and content analysis. This plan outlines how MedCart Kenya can leverage these APIs to:"),
      bullet("Identify high-value pharmacy and health keywords in the Kenyan market"),
      bullet("Track search engine rankings for 8,800+ product pages"),
      bullet("Monitor competitor strategies (MyDawa, Goodlife, Pharmaplus)"),
      bullet("Automate on-page SEO audits across all product and blog pages"),
      bullet("Discover backlink opportunities to build domain authority"),
      bullet("Optimize content strategy for the health blog"),
      para("Estimated monthly investment: $100-$250/month (pay-per-use). Expected ROI: 3-5x within 6 months through increased organic traffic.", { bold: true, color: "00A651" }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 2. DATAFORSEO OVERVIEW ====================
      heading("2. DataForSEO Overview & API Products"),
      para("DataForSEO is a comprehensive SEO data provider offering 15+ API products with pay-per-use pricing. Key stats: 7.9 billion Google keywords tracked, 2.1 trillion live backlinks indexed, and coverage of 200+ countries including Kenya."),

      heading("Relevant APIs for MedCart Kenya", HeadingLevel.HEADING_2),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 3800, 1800, 1560],
        rows: [
          new TableRow({ children: [headerCell("API Product", 2200), headerCell("Key Features", 3800), headerCell("Use Case", 1800), headerCell("Priority", 1560)] }),
          new TableRow({ children: [
            cell("SERP API", 2200, { bold: true }), cell("Real-time Google SERP data for any keyword, location, language. Organic, Maps, News results.", 3800),
            cell("Rank tracking", 1800), cell("HIGH", 1560, { color: "DC2626", bold: true })] }),
          new TableRow({ children: [
            cell("Keywords Data API", 2200, { bold: true }), cell("Search volume, CPC, competition, keyword suggestions from Google Ads & Trends.", 3800),
            cell("Keyword research", 1800), cell("HIGH", 1560, { color: "DC2626", bold: true })] }),
          new TableRow({ children: [
            cell("DataForSEO Labs API", 2200, { bold: true }), cell("Keyword difficulty, SERP competitors, domain metrics, keyword gap analysis.", 3800),
            cell("Competitor analysis", 1800), cell("HIGH", 1560, { color: "DC2626", bold: true })] }),
          new TableRow({ children: [
            cell("On-Page API", 2200, { bold: true }), cell("Technical SEO audits: page speed, meta tags, headings, images, links, schema.", 3800),
            cell("Site audits", 1800), cell("MEDIUM", 1560, { color: "F59E0B", bold: true })] }),
          new TableRow({ children: [
            cell("Backlinks API", 2200, { bold: true }), cell("Backlink profile, referring domains, anchor text, new/lost links.", 3800),
            cell("Link building", 1800), cell("MEDIUM", 1560, { color: "F59E0B", bold: true })] }),
          new TableRow({ children: [
            cell("Content Analysis API", 2200, { bold: true }), cell("Content performance, sentiment analysis, topic clustering.", 3800),
            cell("Blog strategy", 1800), cell("LOW", 1560, { color: "00A651", bold: true })] }),
          new TableRow({ children: [
            cell("Merchant API", 2200, { bold: true }), cell("Google Shopping data, product pricing, competitor product listings.", 3800),
            cell("Pricing intel", 1800), cell("LOW", 1560, { color: "00A651", bold: true })] }),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 3. STRATEGIC USE CASES ====================
      heading("3. Strategic Use Cases for MedCart Kenya"),

      heading("3.1 Pharmacy Keyword Research & Discovery", HeadingLevel.HEADING_2),
      para("Use the Keywords Data API to discover high-volume, low-competition pharmacy keywords in Kenya. Focus on:"),
      bullet("Product-specific keywords: \"buy panadol online Kenya\", \"vitamin C supplements Nairobi\""),
      bullet("Condition-based keywords: \"diabetes medication Kenya\", \"skin care products for acne\""),
      bullet("Informational keywords for blog: \"how to manage blood pressure\", \"best vitamins for immunity\""),
      bullet("Local keywords: \"pharmacy near me Nairobi\", \"online pharmacy Mombasa delivery\""),
      para("Action: Run monthly keyword research for 500-1000 seed keywords across health categories. Export to a keyword database for content planning.", { italics: true }),

      heading("3.2 Competitor SERP Tracking", HeadingLevel.HEADING_2),
      para("Track MedCart Kenya rankings vs. competitors for target keywords:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ children: [headerCell("Competitor", 3120), headerCell("Website", 3120), headerCell("Focus", 3120)] }),
          new TableRow({ children: [cell("MyDawa", 3120), cell("mydawa.com", 3120), cell("Full pharmacy, strong SEO", 3120)] }),
          new TableRow({ children: [cell("Goodlife Pharmacy", 3120), cell("goodlife.co.ke", 3120), cell("Retail chain, beauty focus", 3120)] }),
          new TableRow({ children: [cell("Pharmaplus", 3120), cell("shop.pharmaplus.co.ke", 3120), cell("Wide product range", 3120)] }),
          new TableRow({ children: [cell("Healthstore Kenya", 3120), cell("healthstore.co.ke", 3120), cell("Health supplements", 3120)] }),
        ]
      }),
      para(""),
      para("Action: Set up weekly SERP tracking for 200 priority keywords. Monitor position changes and SERP feature appearances (featured snippets, People Also Ask).", { italics: true }),

      heading("3.3 On-Page SEO Automation", HeadingLevel.HEADING_2),
      para("Use the On-Page API to crawl and audit all 8,800+ product pages automatically:"),
      bullet("Check meta titles and descriptions (length, keyword presence)"),
      bullet("Validate heading hierarchy (H1, H2, H3 structure)"),
      bullet("Detect broken images and missing alt tags"),
      bullet("Check page load speed and Core Web Vitals"),
      bullet("Verify schema markup (Product, Organization, Article)"),
      bullet("Find duplicate content and thin pages"),
      para("Action: Run monthly automated audits. Generate reports with prioritized fix lists.", { italics: true }),

      heading("3.4 Backlink Intelligence & Link Building", HeadingLevel.HEADING_2),
      para("Use the Backlinks API to:"),
      bullet("Analyze competitor backlink profiles (who links to MyDawa, Goodlife?)"),
      bullet("Identify Kenyan health/wellness sites for outreach"),
      bullet("Monitor new and lost backlinks to afyacart.net"),
      bullet("Find broken link opportunities on competitor sites"),
      bullet("Track domain authority growth over time"),

      heading("3.5 Blog Content Strategy", HeadingLevel.HEADING_2),
      para("Use Keywords Data + Content Analysis APIs to plan blog content:"),
      bullet("Find trending health topics in Kenya with search volume data"),
      bullet("Identify content gaps vs. competitors (topics they rank for, we don't)"),
      bullet("Optimize existing blog posts with related keyword suggestions"),
      bullet("Track blog post rankings and traffic impact"),

      heading("3.6 Product Page Optimization", HeadingLevel.HEADING_2),
      para("Use SERP API + Labs API to optimize product pages:"),
      bullet("Find which products have the highest search demand"),
      bullet("Optimize product titles based on actual search queries"),
      bullet("Add FAQ sections based on \"People Also Ask\" data"),
      bullet("Create category landing pages for high-volume keywords"),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 4. IMPLEMENTATION ROADMAP ====================
      heading("4. Implementation Roadmap"),

      heading("Phase 1: Foundation (Month 1)", HeadingLevel.HEADING_2),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Create DataForSEO account and load $50 initial credits", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Build Node.js integration scripts for Keywords Data API", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Run initial keyword research: 500 pharmacy seed keywords", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Set up SERP tracking for top 100 keywords", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Run first On-Page audit on top 50 product pages", font: "Arial", size: 21 })] }),

      heading("Phase 2: Competitor Intelligence (Month 2)", HeadingLevel.HEADING_2),
      new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Analyze competitor backlink profiles (MyDawa, Goodlife, Pharmaplus)", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Run keyword gap analysis vs. competitors using Labs API", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Identify 50 quick-win keywords (low difficulty, high volume)", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers2", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Begin link building outreach to identified health sites", font: "Arial", size: 21 })] }),

      heading("Phase 3: Content & Optimization (Month 3-4)", HeadingLevel.HEADING_2),
      new Paragraph({ numbering: { reference: "numbers3", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Create content calendar from keyword research data", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers3", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Write 12 SEO-optimized blog posts targeting discovered keywords", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers3", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Optimize product titles and descriptions based on search data", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers3", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Run full site On-Page audit (all 8,800 pages)", font: "Arial", size: 21 })] }),
      new Paragraph({ numbering: { reference: "numbers3", level: 0 }, spacing: { after: 80 },
        children: [new TextRun({ text: "Set up automated monthly reporting dashboard", font: "Arial", size: 21 })] }),

      heading("Phase 4: Scale & Automate (Month 5-6)", HeadingLevel.HEADING_2),
      bullet("Expand keyword tracking to 500+ keywords"),
      bullet("Automate weekly SERP checks with cron jobs"),
      bullet("Build internal SEO dashboard using DataForSEO data"),
      bullet("A/B test product titles based on keyword data"),
      bullet("Monthly competitive analysis reports"),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 5. API INTEGRATION ====================
      heading("5. API Integration Architecture"),
      para("All DataForSEO APIs use REST with HTTP Basic authentication. Integration will be built as Node.js scripts within the MedCart project."),

      heading("Technical Setup", HeadingLevel.HEADING_2),
      bullet("API Base URL: https://api.dataforseo.com/v3/"),
      bullet("Authentication: HTTP Basic Auth (login + password from dashboard)"),
      bullet("Format: JSON request/response"),
      bullet("Rate Limits: 2,000 requests per minute"),
      bullet("Location Target: Kenya (location_code: 2404)"),
      bullet("Language: English (language_code: en)"),

      heading("Integration Points", HeadingLevel.HEADING_2),
      bullet("scripts/seo/keyword-research.js - Monthly keyword discovery"),
      bullet("scripts/seo/serp-tracker.js - Weekly ranking checks"),
      bullet("scripts/seo/site-audit.js - Monthly on-page audit"),
      bullet("scripts/seo/backlink-monitor.js - Weekly backlink tracking"),
      bullet("scripts/seo/competitor-analysis.js - Monthly competitor reports"),
      bullet("Data stored in SQLite tables: seo_keywords, seo_rankings, seo_audits"),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 6. BUDGET ESTIMATION ====================
      heading("6. Budget Estimation"),
      para("DataForSEO uses pay-per-use pricing with a $50 minimum top-up. Below is the estimated monthly cost for MedCart Kenya:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1800, 1600, 1600, 1560],
        rows: [
          new TableRow({ children: [headerCell("Activity", 2800), headerCell("API Used", 1800), headerCell("Est. Requests", 1600), headerCell("Cost/Request", 1600), headerCell("Monthly Cost", 1560)] }),
          new TableRow({ children: [cell("Keyword Research (500 keywords)", 2800), cell("Keywords Data", 1800), cell("500", 1600), cell("$0.05", 1600), cell("$25", 1560, { bold: true })] }),
          new TableRow({ children: [cell("SERP Tracking (200 keywords weekly)", 2800), cell("SERP API", 1800), cell("800", 1600), cell("$0.05", 1600), cell("$40", 1560, { bold: true })] }),
          new TableRow({ children: [cell("On-Page Audit (200 pages)", 2800), cell("On-Page API", 1800), cell("200", 1600), cell("$0.05", 1600), cell("$10", 1560, { bold: true })] }),
          new TableRow({ children: [cell("Backlink Analysis (5 domains)", 2800), cell("Backlinks API", 1800), cell("50", 1600), cell("$0.20", 1600), cell("$10", 1560, { bold: true })] }),
          new TableRow({ children: [cell("Competitor Analysis", 2800), cell("Labs API", 1800), cell("100", 1600), cell("$0.10", 1600), cell("$10", 1560, { bold: true })] }),
          new TableRow({ children: [cell("Content Analysis", 2800), cell("Content API", 1800), cell("50", 1600), cell("$0.10", 1600), cell("$5", 1560, { bold: true })] }),
          new TableRow({ children: [
            cell("TOTAL ESTIMATED MONTHLY", 2800, { bold: true, fill: "E8F5E9" }),
            cell("", 1800, { fill: "E8F5E9" }), cell("~1,700", 1600, { fill: "E8F5E9" }),
            cell("", 1600, { fill: "E8F5E9" }), cell("$100-$150", 1560, { bold: true, color: "00A651", fill: "E8F5E9" })] }),
        ]
      }),
      para(""),
      para("Note: Costs are estimates. Actual pricing may vary. DataForSEO minimum top-up is $50. Budget $150-$250/month for comprehensive coverage including scaling.", { italics: true }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 7. KPIs ====================
      heading("7. KPIs & Success Metrics"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 2200, 2200, 2160],
        rows: [
          new TableRow({ children: [headerCell("KPI", 2800), headerCell("Current Baseline", 2200), headerCell("3-Month Target", 2200), headerCell("6-Month Target", 2160)] }),
          new TableRow({ children: [cell("Organic Traffic (monthly)", 2800), cell("TBD (new site)", 2200), cell("+50% growth", 2200), cell("+200% growth", 2160)] }),
          new TableRow({ children: [cell("Keywords in Top 10", 2800), cell("0", 2200), cell("50 keywords", 2200), cell("200 keywords", 2160)] }),
          new TableRow({ children: [cell("Keywords in Top 50", 2800), cell("0", 2200), cell("200 keywords", 2200), cell("500 keywords", 2160)] }),
          new TableRow({ children: [cell("Domain Authority", 2800), cell("0 (new domain)", 2200), cell("15+", 2200), cell("25+", 2160)] }),
          new TableRow({ children: [cell("Referring Domains", 2800), cell("0", 2200), cell("30+", 2200), cell("80+", 2160)] }),
          new TableRow({ children: [cell("Blog Traffic Share", 2800), cell("0%", 2200), cell("15%", 2200), cell("30%", 2160)] }),
          new TableRow({ children: [cell("Conversion from Organic", 2800), cell("TBD", 2200), cell("2% CVR", 2200), cell("3% CVR", 2160)] }),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 8. RISK ASSESSMENT ====================
      heading("8. Risk Assessment"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 1200, 2880, 2880],
        rows: [
          new TableRow({ children: [headerCell("Risk", 2400), headerCell("Severity", 1200), headerCell("Mitigation", 2880), headerCell("Owner", 2880)] }),
          new TableRow({ children: [cell("API costs exceed budget", 2400), cell("Medium", 1200, { color: "F59E0B" }), cell("Set spending limits in DataForSEO dashboard. Start with $50/month.", 2880), cell("Marketing Lead", 2880)] }),
          new TableRow({ children: [cell("Low search volume for pharmacy keywords in Kenya", 2400), cell("Medium", 1200, { color: "F59E0B" }), cell("Focus on long-tail keywords. Use Clickstream data for real volume estimates.", 2880), cell("SEO Specialist", 2880)] }),
          new TableRow({ children: [cell("Competitor SEO response", 2400), cell("Low", 1200, { color: "00A651" }), cell("Continuous monitoring. Diversify keyword strategy across categories.", 2880), cell("Marketing Team", 2880)] }),
          new TableRow({ children: [cell("Technical integration complexity", 2400), cell("Low", 1200, { color: "00A651" }), cell("APIs are REST/JSON. Node.js scripts already in project. Well-documented.", 2880), cell("Developer", 2880)] }),
          new TableRow({ children: [cell("Data accuracy for Kenya market", 2400), cell("Medium", 1200, { color: "F59E0B" }), cell("Cross-validate with Google Search Console data. Use Clickstream for real metrics.", 2880), cell("SEO Specialist", 2880)] }),
        ]
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ==================== 9. NEXT STEPS ====================
      heading("9. Next Steps"),
      para("To begin implementing this DataForSEO strategy, the following immediate actions are recommended:"),
      para(""),

      heading("Immediate Actions (This Week)", HeadingLevel.HEADING_2),
      bullet("Create a DataForSEO account at dataforseo.com"),
      bullet("Load $50 initial credits (minimum top-up)"),
      bullet("Set up API credentials and test with a simple SERP query for \"online pharmacy Kenya\""),
      bullet("Install DataForSEO MCP integration for Claude Code (available at dataforseo.com)"),

      heading("Short-Term Actions (Weeks 2-4)", HeadingLevel.HEADING_2),
      bullet("Build keyword research script targeting pharmacy/health keywords"),
      bullet("Run initial competitor analysis on MyDawa, Goodlife, Pharmaplus domains"),
      bullet("Set up SERP tracking for top 100 priority keywords"),
      bullet("Run first On-Page audit on product pages"),
      bullet("Create a keyword-to-content mapping spreadsheet"),

      heading("Monthly Recurring Tasks", HeadingLevel.HEADING_2),
      bullet("Keyword research expansion (add 100 new keywords/month)"),
      bullet("Weekly SERP ranking report generation"),
      bullet("Monthly on-page audit of new/updated pages"),
      bullet("Monthly backlink monitoring and outreach"),
      bullet("Quarterly competitive analysis deep-dive"),

      para(""),
      para(""),
      new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 6, color: "00A651", space: 12 } }, alignment: AlignmentType.CENTER, spacing: { before: 300 },
        children: [new TextRun({ text: "Prepared by MedCart Kenya Digital Marketing Team", font: "Arial", size: 20, color: "999999", italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "For questions, contact: seo@afyacart.net", font: "Arial", size: 20, color: "999999" })] }),
    ]
  }]
});

const outputPath = "C:/Users/ENG. KIPTOO/Desktop/Firecrawl/MedCart-DataForSEO-Strategy-Plan.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log("Document created: " + outputPath);
  console.log("Size: " + (buffer.length / 1024).toFixed(1) + " KB");
});
