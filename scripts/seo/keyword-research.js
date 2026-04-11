/**
 * DataForSEO Keyword Research Script
 * Discovers pharmacy/health keywords for the Kenyan market
 * Uses: Keywords Data API (Google Ads - Keywords For Keywords)
 *
 * Usage: node scripts/seo/keyword-research.js
 */

const { post, sleep } = require('./dataforseo-client');
const { getDb } = require('../../config/database');
const fs = require('fs');
const path = require('path');

// Kenya location code for DataForSEO
const LOCATION_CODE = 2404; // Kenya
const LANGUAGE_CODE = 'en';

// Pharmacy seed keywords organized by category
const SEED_KEYWORDS = {
  'Medicine & OTC': [
    'buy medicine online Kenya', 'online pharmacy Kenya', 'pharmacy delivery Nairobi',
    'paracetamol price Kenya', 'ibuprofen buy online', 'antibiotics Kenya',
    'cough syrup Kenya', 'allergy medicine Kenya', 'pain relief tablets',
    'fever medicine', 'cold and flu medicine', 'antacid tablets Kenya',
    'eye drops Kenya', 'ear drops', 'first aid supplies Kenya',
    'bandages and plasters', 'thermometer buy Kenya', 'blood pressure medicine',
    'diabetes medication Kenya', 'asthma inhaler Kenya',
  ],
  'Vitamins & Supplements': [
    'vitamins Kenya', 'vitamin C supplements', 'vitamin D3 Kenya',
    'omega 3 fish oil', 'multivitamins Kenya', 'iron supplements',
    'calcium supplements', 'zinc tablets', 'probiotics Kenya',
    'vitamin B complex', 'folic acid supplements', 'biotin supplements',
    'collagen supplements Kenya', 'protein supplements Nairobi',
    'immunity boosters Kenya', 'energy supplements', 'weight loss supplements',
    'prenatal vitamins Kenya', 'children vitamins', 'elderberry supplements',
  ],
  'Beauty & Skin Care': [
    'skin care products Kenya', 'sunscreen Kenya', 'moisturizer Kenya',
    'face wash Kenya', 'acne treatment Kenya', 'anti aging cream',
    'body lotion Kenya', 'lip balm', 'facial serum Kenya',
    'CeraVe Kenya', 'La Roche Posay Kenya', 'Nivea products Kenya',
    'Dove products Kenya', 'natural skin care', 'dry skin treatment',
    'oily skin products', 'dark spot remover', 'stretch mark cream',
    'hair care products Kenya', 'shampoo Kenya',
  ],
  'Baby & Mum': [
    'baby products Kenya', 'diapers Kenya', 'baby formula Kenya',
    'baby wipes', 'baby lotion', 'baby shampoo Kenya',
    'breastfeeding supplies', 'baby thermometer', 'teething gel Kenya',
    'baby vitamins', 'pregnancy vitamins Kenya', 'maternity care products',
    'baby food Kenya', 'nappy rash cream', 'baby oil Kenya',
  ],
  'Personal Care': [
    'toothpaste Kenya', 'mouthwash Kenya', 'deodorant Kenya',
    'hand sanitizer Kenya', 'soap Kenya', 'shower gel',
    'feminine care products', 'condoms Kenya', 'sexual health products',
    'hair removal products', 'men grooming Kenya', 'perfume Kenya',
  ],
  'Medical Devices': [
    'blood pressure monitor Kenya', 'glucose meter Kenya',
    'pulse oximeter Kenya', 'nebulizer Kenya', 'wheelchair Kenya',
    'walking stick', 'knee support Kenya', 'back support brace',
    'face mask Kenya', 'gloves medical', 'syringe buy Kenya',
  ],
  'Pharmacy General': [
    'pharmacy near me Nairobi', 'online pharmacy Mombasa',
    'cheapest pharmacy Kenya', '24 hour pharmacy Nairobi',
    'pharmacy delivery same day', 'prescription medicine online Kenya',
    'generic medicine Kenya', 'herbal medicine Kenya',
    'traditional medicine Kenya', 'pharmacy Kisumu',
    'pharmacy Eldoret', 'pharmacy Nakuru',
    'health products online Kenya', 'wellness products Kenya',
    'medical supplies Kenya',
  ],
};

async function runKeywordResearch() {
  console.log('=== DataForSEO Keyword Research ===\n');

  // Set up database
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      search_volume INTEGER DEFAULT 0,
      cpc REAL DEFAULT 0,
      competition REAL DEFAULT 0,
      competition_level TEXT,
      category TEXT,
      seed_keyword TEXT,
      monthly_searches TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(keyword)
    )
  `);
  db.exec('CREATE INDEX IF NOT EXISTS idx_seo_kw ON seo_keywords(keyword)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_seo_vol ON seo_keywords(search_volume DESC)');

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO seo_keywords (keyword, search_volume, cpc, competition, competition_level, category, seed_keyword, monthly_searches)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalKeywords = 0;
  let totalRequests = 0;
  const allKeywords = [];

  // Process each category
  for (const [category, seeds] of Object.entries(SEED_KEYWORDS)) {
    console.log(`\n--- ${category} (${seeds.length} seeds) ---`);

    // Batch seeds in groups of 10 (API limit)
    for (let i = 0; i < seeds.length; i += 10) {
      const batch = seeds.slice(i, i + 10);
      totalRequests++;

      console.log(`  Batch ${Math.ceil((i + 1) / 10)}: "${batch[0]}" + ${batch.length - 1} more...`);

      try {
        const result = await post('keywords_data/google_ads/keywords_for_keywords/live', [{
          keywords: batch,
          location_code: LOCATION_CODE,
          language_code: LANGUAGE_CODE,
          sort_by: 'search_volume',
          include_seed_keyword: true,
        }]);

        if (result.tasks && result.tasks[0] && result.tasks[0].result) {
          const keywords = result.tasks[0].result;

          db.exec('BEGIN');
          for (const kw of keywords) {
            if (!kw.keyword) continue;

            const monthlyData = kw.monthly_searches
              ? JSON.stringify(kw.monthly_searches.map(m => ({ year: m.year, month: m.month, vol: m.search_volume })))
              : null;

            insertStmt.run(
              kw.keyword,
              kw.search_volume || 0,
              kw.cpc || 0,
              kw.competition || 0,
              kw.competition_level || 'UNKNOWN',
              category,
              batch[0],
              monthlyData
            );
            totalKeywords++;

            allKeywords.push({
              keyword: kw.keyword,
              volume: kw.search_volume || 0,
              cpc: kw.cpc || 0,
              competition: kw.competition_level || '',
              category,
            });
          }
          db.exec('COMMIT');

          console.log(`    Found ${keywords.length} keywords`);
        }
      } catch (err) {
        console.error(`    Error: ${err.message}`);
      }

      // Rate limit: wait between requests
      await sleep(1500);
    }
  }

  // Sort by volume and save CSV report
  allKeywords.sort((a, b) => b.volume - a.volume);

  const csvPath = path.join(__dirname, '../../keyword-research-report.csv');
  const csvHeader = 'Keyword,Search Volume,CPC (USD),Competition,Category\n';
  const csvRows = allKeywords.map(k =>
    `"${k.keyword}",${k.volume},${k.cpc.toFixed(2)},${k.competition},"${k.category}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');

  // Print summary
  console.log('\n\n=== KEYWORD RESEARCH COMPLETE ===');
  console.log(`  API requests made: ${totalRequests}`);
  console.log(`  Total keywords discovered: ${totalKeywords}`);
  console.log(`  Saved to database: seo_keywords table`);
  console.log(`  CSV report: ${csvPath}`);

  console.log('\n--- Top 30 Keywords by Volume ---');
  const top30 = db.prepare('SELECT keyword, search_volume, cpc, competition_level, category FROM seo_keywords ORDER BY search_volume DESC LIMIT 30').all();
  top30.forEach((k, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${k.keyword.padEnd(45)} Vol: ${String(k.search_volume).padStart(6)}  CPC: $${k.cpc.toFixed(2).padStart(5)}  ${k.competition_level}`);
  });

  console.log('\n--- Keywords by Category ---');
  const byCat = db.prepare('SELECT category, COUNT(*) as cnt, AVG(search_volume) as avg_vol FROM seo_keywords GROUP BY category ORDER BY cnt DESC').all();
  byCat.forEach(c => {
    console.log(`  ${c.category.padEnd(25)} ${c.cnt} keywords  (avg vol: ${Math.round(c.avg_vol)})`);
  });

  console.log('\n--- High Opportunity Keywords (Vol > 100, Low Competition) ---');
  const opportunities = db.prepare("SELECT keyword, search_volume, cpc, category FROM seo_keywords WHERE search_volume > 100 AND (competition_level = 'LOW' OR competition < 0.3) ORDER BY search_volume DESC LIMIT 20").all();
  opportunities.forEach((k, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${k.keyword.padEnd(45)} Vol: ${k.search_volume}  CPC: $${k.cpc.toFixed(2)}  [${k.category}]`);
  });
}

runKeywordResearch().catch(console.error);
