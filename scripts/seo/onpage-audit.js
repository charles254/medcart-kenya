/**
 * DataForSEO On-Page SEO Audit
 * Audits top 50 product pages for technical SEO issues
 * Uses: On-Page API (Task Post → Task Ready → Results)
 *
 * Usage: node scripts/seo/onpage-audit.js
 */

const { post, get, sleep } = require('./dataforseo-client');
const { getDb } = require('../../config/database');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://afyacart.net';

async function runOnPageAudit() {
  console.log('=== DataForSEO On-Page SEO Audit ===\n');
  console.log(`Target: ${TARGET_URL}\n`);

  const db = getDb();

  // Create audit table
  db.exec(`
    CREATE TABLE IF NOT EXISTS seo_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      status_code INTEGER,
      title TEXT,
      title_length INTEGER,
      description TEXT,
      description_length INTEGER,
      h1_count INTEGER,
      h1_text TEXT,
      word_count INTEGER,
      images_count INTEGER,
      images_without_alt INTEGER,
      internal_links INTEGER,
      external_links INTEGER,
      page_size INTEGER,
      load_time REAL,
      has_schema INTEGER DEFAULT 0,
      has_canonical INTEGER DEFAULT 0,
      has_og_tags INTEGER DEFAULT 0,
      issues TEXT,
      score REAL,
      audited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(url, audited_at)
    )
  `);

  // Step 1: Submit the crawl task
  console.log('Step 1: Submitting crawl task...');
  let taskId = null;

  try {
    const taskResult = await post('on_page/task_post', [{
      target: TARGET_URL,
      max_crawl_pages: 60,
      load_resources: true,
      enable_javascript: true,
      enable_browser_rendering: true,
      custom_js: 'meta = {}; meta.title = document.title; meta.description = document.querySelector("meta[name=description]")?.content;',
    }]);

    if (taskResult.tasks && taskResult.tasks[0]) {
      taskId = taskResult.tasks[0].id;
      console.log(`  Task submitted: ${taskId}`);
    }
  } catch (err) {
    console.error(`  Error submitting task: ${err.message}`);
    console.log('\n  Falling back to instant page audit...');
    await runInstantAudit(db);
    return;
  }

  // Step 2: Wait for crawl to complete
  console.log('\nStep 2: Waiting for crawl to complete...');
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    await sleep(10000);
    try {
      const status = await get('on_page/tasks_ready');
      if (status.tasks && status.tasks[0] && status.tasks[0].result) {
        for (const task of status.tasks[0].result) {
          if (task.id === taskId) {
            ready = true;
            break;
          }
        }
      }
    } catch (e) { /* retry */ }

    if (ready) {
      console.log(`  Crawl complete! (after ${(attempt + 1) * 10}s)`);
      break;
    }
    process.stdout.write(`  Waiting... (${(attempt + 1) * 10}s)\r`);
  }

  if (!ready) {
    console.log('\n  Crawl timed out. Running instant audit instead...');
    await runInstantAudit(db);
    return;
  }

  // Step 3: Get results
  console.log('\nStep 3: Fetching audit results...');
  try {
    const pages = await post(`on_page/pages`, [{
      id: taskId,
      limit: 50,
      order_by: ['meta.internal_links_count,desc'],
    }]);

    if (pages.tasks && pages.tasks[0] && pages.tasks[0].result) {
      const items = pages.tasks[0].result[0]?.items || [];
      processAuditResults(db, items);
    }
  } catch (err) {
    console.error(`  Error fetching results: ${err.message}`);
    await runInstantAudit(db);
  }
}

// Fallback: Audit pages one by one using instant API
async function runInstantAudit(db) {
  console.log('\n--- Running Instant Page Audits ---\n');

  // Get top 50 product slugs from database
  const products = db.prepare(`
    SELECT slug, title FROM products
    WHERE in_stock = 1 AND primary_image IS NOT NULL
    ORDER BY stock_quantity DESC
    LIMIT 50
  `).all();

  const pages = [
    { url: `${TARGET_URL}/`, label: 'Homepage' },
    { url: `${TARGET_URL}/brands`, label: 'Brands' },
    { url: `${TARGET_URL}/deals`, label: 'Deals' },
    { url: `${TARGET_URL}/blog`, label: 'Blog' },
    { url: `${TARGET_URL}/about`, label: 'About' },
    ...products.slice(0, 45).map(p => ({
      url: `${TARGET_URL}/product/${p.slug}`,
      label: p.title.substring(0, 40),
    })),
  ];

  console.log(`Auditing ${pages.length} pages...\n`);

  const insertStmt = db.prepare(`
    INSERT INTO seo_audits (url, status_code, title, title_length, description, description_length,
      h1_count, word_count, images_count, images_without_alt, internal_links, external_links,
      page_size, has_canonical, has_og_tags, issues, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalIssues = 0;
  const auditResults = [];

  for (let i = 0; i < pages.length; i += 5) {
    const batch = pages.slice(i, i + 5);
    const tasks = batch.map(p => ({
      url: p.url,
      enable_javascript: true,
      enable_browser_rendering: true,
    }));

    console.log(`  [${i + 1}-${Math.min(i + 5, pages.length)}/${pages.length}] ${batch[0].label}...`);

    try {
      const result = await post('on_page/instant_pages', tasks);

      if (result.tasks) {
        db.exec('BEGIN');
        for (const task of result.tasks) {
          if (!task.result || !task.result[0]) continue;
          const items = task.result[0].items || [];
          for (const page of items) {
            const issues = analyzeIssues(page);
            const score = calculateScore(page, issues);

            insertStmt.run(
              page.url || task.data?.url,
              page.status_code || 0,
              page.meta?.title || '',
              (page.meta?.title || '').length,
              page.meta?.description || '',
              (page.meta?.description || '').length,
              page.meta?.htags?.h1?.length || 0,
              page.meta?.content?.plain_text_word_count || 0,
              page.meta?.images_count || 0,
              page.meta?.images_alt_count ? (page.meta.images_count - page.meta.images_alt_count) : 0,
              page.meta?.internal_links_count || 0,
              page.meta?.external_links_count || 0,
              page.page_timing?.download_size || 0,
              page.meta?.canonical ? 1 : 0,
              page.meta?.social_media_tags?.['og:title'] ? 1 : 0,
              JSON.stringify(issues),
              score
            );

            totalIssues += issues.length;
            auditResults.push({ url: page.url || task.data?.url, score, issues });
          }
        }
        db.exec('COMMIT');
      }
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }

    await sleep(2000);
  }

  printAuditReport(db, auditResults, totalIssues);
}

function processAuditResults(db, items) {
  const insertStmt = db.prepare(`
    INSERT INTO seo_audits (url, status_code, title, title_length, description, description_length,
      h1_count, word_count, images_count, images_without_alt, internal_links, external_links,
      page_size, has_canonical, has_og_tags, issues, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalIssues = 0;
  const auditResults = [];

  db.exec('BEGIN');
  for (const page of items) {
    const issues = analyzeIssues(page);
    const score = calculateScore(page, issues);

    insertStmt.run(
      page.url,
      page.status_code || 0,
      page.meta?.title || '',
      (page.meta?.title || '').length,
      page.meta?.description || '',
      (page.meta?.description || '').length,
      page.meta?.htags?.h1?.length || 0,
      page.meta?.content?.plain_text_word_count || 0,
      page.meta?.images_count || 0,
      page.meta?.images_alt_count ? (page.meta.images_count - page.meta.images_alt_count) : 0,
      page.meta?.internal_links_count || 0,
      page.meta?.external_links_count || 0,
      page.page_timing?.download_size || 0,
      page.meta?.canonical ? 1 : 0,
      page.meta?.social_media_tags?.['og:title'] ? 1 : 0,
      JSON.stringify(issues),
      score
    );

    totalIssues += issues.length;
    auditResults.push({ url: page.url, score, issues });
  }
  db.exec('COMMIT');

  printAuditReport(db, auditResults, totalIssues);
}

function analyzeIssues(page) {
  const issues = [];
  const meta = page.meta || {};
  const title = meta.title || '';
  const desc = meta.description || '';

  // Title checks
  if (!title) issues.push({ severity: 'critical', issue: 'Missing page title' });
  else if (title.length < 30) issues.push({ severity: 'warning', issue: `Title too short (${title.length} chars, min 30)` });
  else if (title.length > 65) issues.push({ severity: 'warning', issue: `Title too long (${title.length} chars, max 65)` });

  // Description checks
  if (!desc) issues.push({ severity: 'critical', issue: 'Missing meta description' });
  else if (desc.length < 70) issues.push({ severity: 'warning', issue: `Description too short (${desc.length} chars, min 70)` });
  else if (desc.length > 160) issues.push({ severity: 'warning', issue: `Description too long (${desc.length} chars, max 160)` });

  // H1 checks
  const h1Count = meta.htags?.h1?.length || 0;
  if (h1Count === 0) issues.push({ severity: 'critical', issue: 'Missing H1 tag' });
  else if (h1Count > 1) issues.push({ severity: 'warning', issue: `Multiple H1 tags (${h1Count})` });

  // Image checks
  const imgCount = meta.images_count || 0;
  const imgAlt = meta.images_alt_count || 0;
  if (imgCount > 0 && imgAlt < imgCount) {
    issues.push({ severity: 'warning', issue: `${imgCount - imgAlt} images missing alt text` });
  }

  // Canonical
  if (!meta.canonical) issues.push({ severity: 'warning', issue: 'Missing canonical tag' });

  // Content length
  const wordCount = meta.content?.plain_text_word_count || 0;
  if (wordCount < 100) issues.push({ severity: 'info', issue: `Thin content (${wordCount} words)` });

  // Status code
  if (page.status_code && page.status_code !== 200) {
    issues.push({ severity: 'critical', issue: `HTTP ${page.status_code} error` });
  }

  return issues;
}

function calculateScore(page, issues) {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 20;
    else if (issue.severity === 'warning') score -= 10;
    else score -= 5;
  }
  return Math.max(0, score);
}

function printAuditReport(db, auditResults, totalIssues) {
  auditResults.sort((a, b) => a.score - b.score);

  // Save CSV
  const csvPath = path.join(__dirname, '../../onpage-audit-report.csv');
  const csvHeader = 'URL,Score,Issues Count,Issues\n';
  const csvRows = auditResults.map(r =>
    `"${r.url}",${r.score},${r.issues.length},"${r.issues.map(i => i.issue).join('; ')}"`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf-8');

  console.log('\n\n=== ON-PAGE AUDIT COMPLETE ===');
  console.log(`  Pages audited: ${auditResults.length}`);
  console.log(`  Total issues found: ${totalIssues}`);
  console.log(`  Average score: ${(auditResults.reduce((s, r) => s + r.score, 0) / auditResults.length).toFixed(1)}/100`);
  console.log(`  CSV report: ${csvPath}`);

  console.log('\n--- Score Distribution ---');
  console.log(`  Excellent (90-100): ${auditResults.filter(r => r.score >= 90).length} pages`);
  console.log(`  Good (70-89):       ${auditResults.filter(r => r.score >= 70 && r.score < 90).length} pages`);
  console.log(`  Needs Work (50-69): ${auditResults.filter(r => r.score >= 50 && r.score < 70).length} pages`);
  console.log(`  Poor (0-49):        ${auditResults.filter(r => r.score < 50).length} pages`);

  console.log('\n--- Pages Needing Attention (Score < 80) ---');
  auditResults.filter(r => r.score < 80).slice(0, 15).forEach(r => {
    console.log(`  Score ${r.score}: ${r.url}`);
    r.issues.forEach(i => console.log(`    [${i.severity.toUpperCase()}] ${i.issue}`));
  });

  console.log('\n--- Most Common Issues ---');
  const issueCounts = {};
  auditResults.forEach(r => r.issues.forEach(i => {
    issueCounts[i.issue] = (issueCounts[i.issue] || 0) + 1;
  }));
  Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([issue, count]) => {
    console.log(`  ${count}x ${issue}`);
  });
}

runOnPageAudit().catch(console.error);
