# SEO Audit Skill (Google Search Fundamentals)

## Description
Comprehensive SEO audit based on Google's official SEO Starter Guide. Checks a website against all Google-recommended best practices for search visibility, indexing, and ranking.

## Usage
Run this skill with a URL to audit: `/seo-audit https://example.com`

## Audit Checklist

### 1. Crawlability & Indexing
- [ ] **robots.txt** exists and is valid
- [ ] **Sitemap.xml** exists, is referenced in robots.txt, and contains < 50,000 URLs per file
- [ ] Sitemap URLs return 200 status codes (spot check 5 random URLs)
- [ ] No accidental `noindex` tags on important pages
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Google Search Console verification file present

### 2. Title Tags (per page type)
- [ ] Every page has a unique `<title>` tag
- [ ] Titles are 30-65 characters (avoid truncation)
- [ ] Titles are descriptive and include target keywords
- [ ] No duplicate " | Brand | Brand" suffix issues
- [ ] Homepage title includes brand name and value proposition

### 3. Meta Descriptions
- [ ] Every page has a unique `<meta name="description">`
- [ ] Descriptions are 70-160 characters
- [ ] Descriptions summarize page content accurately
- [ ] No template variables leak (empty cities, "0 results", etc.)
- [ ] No grammar errors in generated descriptions

### 4. Canonical Tags
- [ ] Every page has `<link rel="canonical">` pointing to itself
- [ ] No cross-page canonical errors (e.g., /about pointing to /)
- [ ] Canonical URLs use HTTPS and consistent trailing slash

### 5. Heading Structure
- [ ] Every page has exactly ONE `<h1>` tag
- [ ] H1 is descriptive and unique per page (not just a name)
- [ ] Heading hierarchy is logical (H1 > H2 > H3, no skipping)
- [ ] Headings aren't used for styling (e.g., tutor names as H3)
- [ ] No empty or template-broken headings

### 6. URL Structure
- [ ] URLs are descriptive, lowercase, hyphenated
- [ ] URLs follow a logical hierarchy (/category/subcategory/page)
- [ ] No random IDs or hash fragments in URLs
- [ ] No duplicate content at multiple URLs (www vs non-www, http vs https)

### 7. Images & Alt Text
- [ ] All `<img>` tags have descriptive `alt` attributes
- [ ] Images are placed near relevant text content
- [ ] Image file names are descriptive (not IMG_1234.jpg)
- [ ] Images are optimized (WebP/AVIF format, compressed)
- [ ] No images rendered only via client-side JS (invisible to Googlebot)

### 8. Internal Linking
- [ ] Every page is reachable within 3 clicks from homepage
- [ ] Anchor text is descriptive (not "click here")
- [ ] Related content is cross-linked (subjects link to cities, etc.)
- [ ] Breadcrumbs are present on deep pages
- [ ] Footer has key navigation links

### 9. Structured Data (JSON-LD)
- [ ] Homepage has Organization or WebSite schema
- [ ] Product/service pages have appropriate schema (Product, Service, Course)
- [ ] FAQ pages have FAQPage schema with valid Q&A pairs
- [ ] BreadcrumbList schema matches visual breadcrumbs
- [ ] No empty/invalid values in structured data
- [ ] Structured data validates at https://validator.schema.org/

### 10. Open Graph & Social Tags
- [ ] `og:title` is page-specific (not hardcoded to homepage)
- [ ] `og:description` is page-specific
- [ ] `og:image` exists with a quality image (1200x630 recommended)
- [ ] `og:url` matches canonical URL
- [ ] `og:type` is appropriate (website, article, product)
- [ ] `twitter:card` is set (summary_large_image)
- [ ] `twitter:title` and `twitter:description` are page-specific

### 11. Mobile & Performance
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] No horizontal scroll on mobile (test at 375px)
- [ ] Touch targets are at least 48x48px
- [ ] Font size is readable on mobile (>= 16px body text)
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### 12. Content Quality
- [ ] No thin content pages (< 100 words of unique text)
- [ ] No pages advertising "0 results" or empty content
- [ ] Content is original, not scraped or auto-generated filler
- [ ] No keyword stuffing
- [ ] Grammar and spelling are correct
- [ ] E-E-A-T signals: author info, credentials, sources cited

### 13. Security & Trust
- [ ] HTTPS with valid SSL certificate
- [ ] No mixed content warnings
- [ ] Security headers present (HSTS, X-Content-Type-Options, CSP)
- [ ] Privacy policy and terms of service pages exist and are linked

## How to Run the Audit

```bash
# 1. Check robots.txt and sitemap
curl -s https://DOMAIN/robots.txt
curl -sI https://DOMAIN/sitemap.xml

# 2. Check homepage SEO tags
curl -s https://DOMAIN | grep -oE '<title>[^<]*</title>'
curl -s https://DOMAIN | grep -oE '<meta name="description" content="[^"]*"'
curl -s https://DOMAIN | grep -oE '<link rel="canonical" [^>]*>'
curl -s https://DOMAIN | grep -oE '<h1[^>]*>[^<]*</h1>'
curl -s https://DOMAIN | grep -o 'og:title\|og:description\|og:image\|og:url'
curl -s https://DOMAIN | grep -o 'twitter:card\|twitter:title\|twitter:image'
curl -s https://DOMAIN | grep -o 'application/ld+json'

# 3. Check a sample of inner pages (repeat above for each)
# 4. Check structured data validity
curl -s https://DOMAIN/page | grep -oP '(?<=application/ld\+json">).*?(?=</script>)'

# 5. Check security headers
curl -sI https://DOMAIN | grep -iE 'strict-transport|x-content-type|x-frame|content-security'

# 6. Check sitemap URL count
curl -s https://DOMAIN/sitemap.xml | grep -c '<url>'
```

## Severity Levels
- **CRITICAL**: Blocks indexing or causes deindexing (wrong canonical, noindex on important pages)
- **HIGH**: Significantly hurts rankings (missing structured data, broken templates, no OG images)
- **MEDIUM**: Reduces SERP quality (title truncation, description length, grammar errors)
- **LOW**: Nice to have (hreflang, sitemap splitting, minor heading hierarchy)

## Output Format
Generate a report with:
1. Summary scorecard table (PASS/WARN/FAIL per page per check)
2. Critical issues list (sorted by severity)
3. Specific fix recommendations with file paths and code changes
