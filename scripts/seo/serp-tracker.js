/**
 * DataForSEO SERP Tracker
 * Tracks Google rankings for top 100 priority keywords in Kenya
 * Uses: SERP API (Google Organic - Live/Advanced)
 *
 * Usage: node scripts/seo/serp-tracker.js
 */

const { post, sleep } = require('./dataforseo-client');
const { getDb } = require('../../config/database');
const fs = require('fs');
const path = require('path');

const LOCATION_CODE = 2404; // Kenya
const LANGUAGE_CODE = 'en';
const TARGET_DOMAIN = 'afyacart.net';

// Top 100 priority keywords to track
const TRACKED_KEYWORDS = [
  // Brand & Generic
  'online pharmacy Kenya', 'buy medicine online Kenya', 'pharmacy delivery Nairobi',
  'Kenya online pharmacy', 'best online pharmacy Kenya', 'cheapest pharmacy Kenya',
  'pharmacy near me Nairobi', '24 hour pharmacy Nairobi', 'pharmacy delivery Mombasa',
  'prescription medicine online Kenya',

  // Product Categories
  'vitamins Kenya', 'supplements Kenya', 'skin care products Kenya',
  'baby products Kenya online', 'health products Kenya', 'medical supplies Kenya',
  'pain relief tablets Kenya', 'cough medicine Kenya', 'allergy medicine Kenya',
  'diabetes supplies Kenya',

  // Specific Products
  'panadol Kenya price', 'vitamin C Kenya', 'omega 3 fish oil Kenya',
  'CeraVe Kenya', 'Nivea products Kenya', 'sunscreen Kenya buy',
  'multivitamins Kenya', 'iron supplements Kenya', 'probiotics Kenya',
  'collagen supplements Kenya',

  // Health Conditions
  'blood pressure medication Kenya', 'diabetes medicine Kenya',
  'asthma inhaler buy Kenya', 'cholesterol medicine Kenya',
  'arthritis treatment Kenya', 'migraine medicine Kenya',
  'flu treatment Kenya', 'malaria medicine Kenya',
  'UTI treatment Kenya', 'fungal infection cream Kenya',

  // Beauty & Personal Care
  'moisturizer Kenya', 'face wash Kenya', 'anti aging cream Kenya',
  'acne treatment Kenya', 'body lotion Kenya', 'hair care Kenya',
  'shampoo Kenya', 'deodorant Kenya', 'toothpaste Kenya',
  'hand sanitizer Kenya',

  // Baby & Mum
  'diapers Kenya', 'baby formula Kenya', 'baby wipes Kenya',
  'pregnancy vitamins Kenya', 'baby care products Kenya',

  // Medical Devices
  'blood pressure monitor Kenya', 'glucose meter Kenya',
  'thermometer buy Kenya', 'pulse oximeter Kenya', 'nebulizer Kenya',

  // Long-tail
  'buy panadol online Nairobi', 'vitamin D3 supplements Kenya',
  'La Roche Posay Kenya price', 'best sunscreen for oily skin Kenya',
  'weight loss supplements Kenya', 'immune boosters Kenya',
  'prenatal vitamins Nairobi', 'protein powder Kenya',
  'biotin hair growth Kenya', 'zinc tablets Kenya',

  // Informational (blog targeting)
  'how to lower blood pressure naturally Kenya',
  'best vitamins for energy', 'skin care routine for oily skin',
  'home remedies for cold Kenya', 'diabetes diet tips',
  'benefits of omega 3', 'vitamin C benefits',
  'how to boost immunity naturally', 'baby teething remedies',
  'first aid kit checklist',

  // Competitor branded
  'mydawa Kenya', 'goodlife pharmacy online', 'pharmaplus Kenya',
  'mydawa delivery', 'goodlife pharmacy Nairobi',

  // Seasonal / Trending
  'flu season medicine Kenya', 'hay fever treatment Kenya',
  'mosquito repellent Kenya', 'rehydration salts Kenya',
  'travel health kit Kenya', 'vaccination Kenya',
];

async function trackSERPs() {
  console.log('=== DataForSEO SERP Tracker ===\n');
  console.log(`Tracking ${TRACKED_KEYWORDS.length} keywords for ${TARGET_DOMAIN}\n`);

  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      position INTEGER,
      url TEXT,
      title TEXT,
      snippet TEXT,
      serp_features TEXT,
      total_results INTEGER,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_rank_kw ON seo_rankings(keyword)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_rank_date ON seo_rankings(checked_at)');

  const insertStmt = db.prepare(`
    INSERT INTO seo_rankings (keyword, position, url, title, snippet, serp_features, total_results)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let tracked = 0;
  let ranking = 0;
  let notRanking = 0;
  const results = [];

  // Process keywords in batches of 3 (to manage API costs)
  for (let i = 0; i < TRACKED_KEYWORDS.length; i += 3) {
    const batch = TRACKED_KEYWORDS.slice(i, i + 3);

    const tasks = batch.map(keyword => ({
      keyword,
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
      depth: 100, // Check top 100 results
      device: 'desktop',
    }));

    console.log(`  [${i + 1}-${Math.min(i + 3, TRACKED_KEYWORDS.length)}/${TRACKED_KEYWORDS.length}] Checking: "${batch[0]}"...`);

    try {
      const result = await post('serp/google/organic/live/advanced', tasks);

      if (result.tasks) {
        db.exec('BEGIN');
        for (const task of result.tasks) {
          if (!task.result || !task.result[0]) continue;

          const serpData = task.result[0];
          const keyword = task.data.keyword;
          const items = serpData.items || [];

          // Find our domain in results
          let ourPosition = null;
          let ourUrl = null;
          let ourTitle = null;
          let ourSnippet = null;

          for (const item of items) {
            if (item.type === 'organic' && item.domain && item.domain.includes(TARGET_DOMAIN)) {
              ourPosition = item.rank_absolute;
              ourUrl = item.url;
              ourTitle = item.title;
              ourSnippet = item.description;
              break;
            }
          }

          // Detect SERP features
          const features = [];
          const typeSet = new Set(items.map(it => it.type));
          if (typeSet.has('featured_snippet')) features.push('Featured Snippet');
          if (typeSet.has('people_also_ask')) features.push('People Also Ask');
          if (typeSet.has('local_pack')) features.push('Local Pack');
          if (typeSet.has('knowledge_graph')) features.push('Knowledge Graph');
          if (typeSet.has('shopping')) features.push('Shopping');
          if (typeSet.has('images')) features.push('Images');
          if (typeSet.has('video')) features.push('Video');

          insertStmt.run(
            keyword,
            ourPosition,
            ourUrl,
            ourTitle,
            ourSnippet,
            features.join(', ') || null,
            serpData.se_results_count || 0
          );

          if (ourPosition) {
            ranking++;
            results.push({ keyword, position: ourPosition, url: ourUrl });
          } else {
            notRanking++;
            results.push({ keyword, position: null, url: null });
          }
          tracked++;
        }
        db.exec('COMMIT');
      }
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }

    await sleep(2000);
  }

  // Sort results
  const rankingResults = results.filter(r => r.position).sort((a, b) => a.position - b.position);
  const notRankingResults = results.filter(r => !r.position);

  // Save CSV report
  const csvPath = path.join(__dirname, '../../serp-tracking-report.csv');
  const csvHeader = 'Keyword,Position,URL,Status\n';
  const csvRows = results.sort((a, b) => (a.position || 999) - (b.position || 999))
    .map(r => `"${r.keyword}",${r.position || 'Not Ranking'},"${r.url || ''}",${r.position ? (r.position <= 10 ? 'Page 1' : r.position <= 20 ? 'Page 2' : 'Page 3+') : 'Not Found'}`)
    .join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');

  // Print summary
  console.log('\n\n=== SERP TRACKING COMPLETE ===');
  console.log(`  Keywords tracked: ${tracked}`);
  console.log(`  Ranking: ${ranking} keywords`);
  console.log(`  Not ranking: ${notRanking} keywords`);
  console.log(`  CSV report: ${csvPath}`);

  if (rankingResults.length > 0) {
    console.log('\n--- Keywords Where AfyaCart Ranks ---');
    rankingResults.forEach((r, i) => {
      const status = r.position <= 3 ? '🥇' : r.position <= 10 ? '✅' : r.position <= 20 ? '🔶' : '⬜';
      console.log(`  ${status} #${String(r.position).padStart(3)} "${r.keyword}"`);
    });
  }

  console.log('\n--- Summary by Position ---');
  console.log(`  Top 3:     ${rankingResults.filter(r => r.position <= 3).length} keywords`);
  console.log(`  Top 10:    ${rankingResults.filter(r => r.position <= 10).length} keywords`);
  console.log(`  Top 20:    ${rankingResults.filter(r => r.position <= 20).length} keywords`);
  console.log(`  Top 50:    ${rankingResults.filter(r => r.position <= 50).length} keywords`);
  console.log(`  Top 100:   ${rankingResults.filter(r => r.position <= 100).length} keywords`);
  console.log(`  Not found: ${notRankingResults.length} keywords`);
}

trackSERPs().catch(console.error);
