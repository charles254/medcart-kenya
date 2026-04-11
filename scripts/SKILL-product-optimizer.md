# Product Title & Meta Description Optimizer

## Purpose
Optimize product titles and meta descriptions in the MedCart pharmacy e-commerce database for better SEO, readability, and conversion. Based on best practices from Describely's product title optimization guide.

## Title Optimization Rules

### Formula (Pharmacy/Health Products)
Use this sequence:
**Brand + Product Type + Key Attribute (Strength/Size) + Primary Benefit + Format**

### Examples
- BAD: "Panadol Extra Tablets 100's"
- GOOD: "Panadol Extra Pain Relief Tablets 500mg - Fast-Acting Paracetamol & Caffeine (100 Tablets)"

- BAD: "Cetamol 500mg Tablets 100's"  
- GOOD: "Cetamol Paracetamol 500mg Tablets - Headache & Fever Relief (100 Tablets)"

- BAD: "CeraVe Foam Cleanser 236ml"
- GOOD: "CeraVe Foaming Facial Cleanser 236ml - For Normal to Oily Skin with Ceramides & Niacinamide"

### Title Rules
1. Keep between 60-120 characters (optimal for search engines)
2. Always start with the brand name
3. Include the product type/category keyword
4. Add key attribute: strength (mg/ml), size, count
5. Include primary benefit or use case
6. Add format in parentheses: (100 Tablets), (250ml Bottle), (30 Capsules)
7. Use " - " (dash with spaces) to separate sections
8. Do NOT keyword stuff
9. Do NOT use ALL CAPS except for brand abbreviations
10. Clean up encoding issues: replace special chars, fix apostrophes

### Category-Specific Patterns

**Medicine/OTC:**
"[Brand] [Drug Name] [Strength] [Form] - [Primary Use] ([Count/Size])"
Example: "Panadol Advance Paracetamol 500mg Tablets - Pain & Fever Relief (100 Tablets)"

**Vitamins & Supplements:**
"[Brand] [Vitamin/Supplement Name] [Strength] [Form] - [Key Benefit] ([Count])"
Example: "Vitabiotics Osteocare Calcium & Vitamin D3 Tablets - Bone Health Support (30 Tablets)"

**Beauty & Skin Care:**
"[Brand] [Product Name] [Size] - [Skin Type/Concern] with [Key Ingredients]"
Example: "CeraVe Moisturizing Cream 454g - For Dry to Very Dry Skin with Ceramides & Hyaluronic Acid"

**Baby & Mum:**
"[Brand] [Product Name] [Size/Count] - [Age Range/Use] ([Format])"
Example: "Huggies Dry Comfort Diapers Size 3 - For Babies 5-9kg (64 Diapers)"

**Medical Devices:**
"[Brand] [Device Name] [Model] - [Key Feature] ([Includes])"
Example: "Omron M2 Blood Pressure Monitor - Clinically Validated Digital Upper Arm (with Cuff)"

## Meta Description Rules

### Formula
**[Primary benefit statement]. [Key feature/ingredient]. [Trust signal]. [Call to action with price if on sale].**

### Rules
1. Keep between 120-160 characters
2. Start with the primary benefit or use case
3. Mention 1-2 key ingredients or features
4. Include a trust signal (genuine, licensed pharmacy, fast delivery)
5. End with a call to action
6. Include "KES [price]" if space allows
7. Do NOT duplicate the title

### Examples
- "Fast-acting pain relief with Paracetamol 500mg. Trusted by millions worldwide. Genuine product with free delivery on orders above KES 2,500."
- "Gentle foaming cleanser for normal to oily skin. Enriched with ceramides and niacinamide. Order now from Kenya's trusted online pharmacy."

## Description Enhancement Rules

### Formula
Write 2-3 paragraphs covering:
1. **What it is** - Product type and primary function
2. **Key benefits** - 3-4 bullet-point worthy benefits
3. **How to use / Who it's for** - Target audience or usage instructions
4. **Trust closer** - Genuine product, fast delivery

### Rules
1. Target 150-200 words
2. Use natural, informative language
3. Include the product name and brand naturally
4. Mention key ingredients or specifications
5. Add usage context (who should use it, when)
6. Keep paragraphs short (2-3 sentences each)
7. Do NOT use marketing hype or unverified claims
8. For medicines: include "consult your doctor" disclaimer

## Implementation
Run: `node scripts/optimize-products.js`
This script reads products from the SQLite database and enhances titles, descriptions, and generates meta descriptions.
