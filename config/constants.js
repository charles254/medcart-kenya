const ITEMS_PER_PAGE = 24;
const AUTOCOMPLETE_LIMIT = 8;

// Normalize varied category names from different pharmacies into unified names
// Maps raw category name (lowercased) to the unified top-level category name
// null means "skip this category"
const TOP_LEVEL_CATEGORY_MAP = {
  'beauty and skin care': 'Beauty & Skin Care',
  'beauty care & cosmetics': 'Beauty & Skin Care',
  'beauty': 'Beauty & Skin Care',
  'skin care': 'Beauty & Skin Care',
  'dermatological skincare': 'Beauty & Skin Care',

  'supplements and nutrition': 'Vitamins & Supplements',
  'vitamins & supplements': 'Vitamins & Supplements',
  'vitamins and supplements': 'Vitamins & Supplements',

  'health conditions': 'Health & Wellness',
  'health & wellness': 'Health & Wellness',

  'mum and baby': 'Mum & Baby',
  'mum & baby': 'Mum & Baby',
  'mum &amp; baby': 'Mum & Baby',
  'baby products': 'Mum & Baby',

  'personal care': 'Personal Care',
  'general hygiene care': 'Personal Care',

  'medical devices': 'Medical Devices',
  'home healthcare': 'Medical Devices',
  'devices and diagnostics': 'Medical Devices',

  'family planning': 'Sexual & Reproductive Health',
  'reproductive health and sexual': 'Sexual & Reproductive Health',
  'sexual & reproductive health': 'Sexual & Reproductive Health',

  'medicine': 'Medicine',
  'prescription products': 'Medicine',

  'iv therapy': 'IV Therapy',

  'snacks and drinks': 'Snacks & Drinks',
  'snacks & drinks': 'Snacks & Drinks',

  'body building': 'Sports & Nutrition',
  'sports & nutrition': 'Sports & Nutrition',

  'pata tiba na thao': 'Traditional Medicine',
  'traditional medicine': 'Traditional Medicine',

  'veterinary products': 'Veterinary',
  'veterinary': 'Veterinary',

  // Skip these -- not real categories
  'offers': null,
  'new on mydawa': null,
  'bundle offers': null,
  'femvive': null,
};

// Emoji icons for each top-level category
const CATEGORY_ICONS = {
  'Beauty & Skin Care': '💄',
  'Vitamins & Supplements': '💊',
  'Health & Wellness': '🏥',
  'Mum & Baby': '👶',
  'Personal Care': '🧴',
  'Medical Devices': '🩺',
  'Sexual & Reproductive Health': '❤️',
  'Medicine': '💉',
  'IV Therapy': '🩸',
  'Snacks & Drinks': '🥤',
  'Sports & Nutrition': '💪',
  'Traditional Medicine': '🌿',
  'Veterinary': '🐾',
};

// Sort options for product listings
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Biggest Discount' },
];

module.exports = {
  ITEMS_PER_PAGE,
  AUTOCOMPLETE_LIMIT,
  TOP_LEVEL_CATEGORY_MAP,
  CATEGORY_ICONS,
  SORT_OPTIONS,
};
