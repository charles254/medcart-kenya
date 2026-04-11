# PharmaCompare Kenya - Design System

## 1. Visual Theme

Clean, trustworthy pharmacy e-commerce design. Green communicates health and wellness, navy conveys trust and professionalism, orange creates urgency for deals and calls-to-action. The overall aesthetic is modern, minimal, and accessible -- prioritizing readability and clear product presentation for a Kenyan audience comparing pharmacy prices.

## 2. Color Palette

| Token | Hex | Role |
|---|---|---|
| Primary Green | `#00A651` | Main brand, buttons, links, success states |
| Primary Dark | `#008C45` | Hover states, footer background |
| Primary Light | `#E8F5E9` | Light backgrounds, highlights |
| Secondary Navy | `#1B3A5C` | Headings, trust elements |
| Accent Orange | `#FF6B35` | Sale badges, urgent CTAs, deals |
| Background | `#F8FAF9` | Page background |
| Cards | `#FFFFFF` | Card surfaces |
| Borders | `#E2E8F0` | Dividers, card borders |
| Text Heading | `#1A1A2E` | Headings, strong text |
| Text Body | `#5A6B7B` | Body copy |
| Text Muted | `#94A3B8` | Secondary text, counts |
| Rx Red | `#DC2626` | Prescription badge, warnings |
| Success | `#00A651` | In-stock, confirmations |

## 3. Typography

Font family: **Inter** from Google Fonts.

| Element | Size | Weight | Line Height |
|---|---|---|---|
| h1 | 2.25rem (36px) | 700 (Bold) | 1.25 |
| h2 | 1.875rem (30px) | 700 (Bold) | 1.25 |
| h3 | 1.5rem (24px) | 700 (Bold) | 1.25 |
| h4 | 1.25rem (20px) | 700 (Bold) | 1.25 |
| Body | 1rem (16px) | 400 (Regular) | 1.5 |
| Small / Labels | 0.875rem (14px) | 500 (Medium) | 1.5 |
| Captions / Badges | 0.75rem (12px) | 600 (Semibold) | 1 |

## 4. Component Stylings

### Buttons
- **Primary**: Green bg (`#00A651`), white text, 6px radius, green shadow on hover
- **Secondary**: Transparent bg, green border and text, fills green on hover
- **Accent**: Orange bg (`#FF6B35`), white text, darkens on hover
- **Small**: Reduced padding (8px 16px), 12px font
- Padding: 12px 24px (default), border-radius: 6px

### Product Cards
- White background, 1px border (`#E2E8F0`), 8px radius
- Image: 1:1 aspect ratio, object-fit contain
- Title: 2-line truncation with `-webkit-line-clamp`
- Hover: translateY(-2px), green-tinted shadow
- Sale badge: orange, positioned top-left
- Rx badge: red, stacked below sale badge

### Form Inputs
- 1px border, 6px radius
- Focus: green border + green ring (3px, 15% opacity)
- Placeholder: muted gray

### Badges
- Sale: orange bg, white text
- Rx: red bg, white text
- In Stock: light green bg, green text
- Out of Stock: gray bg, muted text

## 5. Layout

- **Spacing scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Max width**: 1200px, centered
- **Grid**: 4-column product grid (desktop), 3-col (tablet), 2-col (mobile)
- **Filter sidebar**: 260px width, sticky on desktop
- **Category page**: sidebar + main content flex layout

## 6. Depth & Shadows

| Level | Shadow | Usage |
|---|---|---|
| sm | `0 1px 2px rgba(0,0,0,0.05)` | Header, subtle elevation |
| md | `0 4px 6px ...` | Dropdowns, cards at rest |
| lg | `0 10px 15px ...` | Autocomplete, modals |
| Green | `0 4px 14px rgba(0,166,81,0.25)` | Primary button hover |
| Card hover | `0 8px 25px rgba(0,166,81,0.15)` | Product card hover |

## 7. Do's and Don'ts

### Do
- Use green for positive actions (Add to Cart, In Stock, Success)
- Use orange sparingly for urgency (deals, discounts)
- Keep product images clean with contain fit
- Show price comparison prominently
- Provide clear Rx indicators for prescription items
- Use KES currency formatting consistently

### Don't
- Don't use red for non-warning elements
- Don't mix more than 2 accent colors on one page
- Don't use shadows heavier than the defined scale
- Don't truncate prices or critical product info
- Don't hide the search bar on any viewport

## 8. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | < 640px | 2-col products, hamburger nav, stacked layout |
| Tablet | 640-767px | 2-col products, hamburger nav |
| Tablet landscape | 768-1023px | 3-col products, visible nav, sidebar collapses |
| Desktop | >= 1024px | 4-col products, full nav, sticky sidebar |

## 9. Agent Prompt Guide

When generating UI for this pharmacy e-commerce site:
- Always use CSS custom properties from `variables.css` for colors, spacing, and typography
- Product cards must include: image (with fallback), title (2-line truncate), brand, price, and Add to Cart button
- Show sale prices in orange with original price crossed out
- Mark prescription products with a red Rx badge
- Use the green gradient hero for landing pages
- Price comparison tables should highlight the cheapest option with green background
- All forms should have green focus rings
- Mobile navigation uses a slide-in panel from the right
- Pagination should show prev/next with page numbers
- Filter sidebar should have collapsible sections
