export const API_ENDPOINTS = {
  DASHBOARD: '/home',
  PRODUCTS: '/products',
  USERS: '/users',
  EXPENSES: '/expenses',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  EXPORT_CATEGORIES: '/categories/export',
  IMPORT_CATEGORIES: '/categories/import',
  CATEGORY_TEMPLATE: '/categories/template',
  EXPORT_BRANDS: '/brands/export',
  IMPORT_BRANDS: '/brands/import',
  BRAND_TEMPLATE: '/brands/template',
  TAGS: '/tags', // Added Tags endpoint
  ORDERS: '/orders',
  VOUCHERS: '/vouchers', // Already exists, ensure it's correct
  BLOGS: '/blogs',
  REVIEWS: '/reviews',
  SHIPPING_ADDRESSES: '/shipping-addresses',
  PRODUCT_IMAGES: '/products/image',
  PRODUCT_VARIANTS: '/product-variants',
  EXPORT_PRODUCTS: '/products/export', // Add Product Export endpoint
  IMPORT_PRODUCTS: '/products/import', // Add Product Import endpoint
  PRODUCT_TEMPLATE: '/products/template', // Add Product Template endpoint
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  CHECK_AUTH: '/auth/me',

  // Statistics Endpoints
  STATS_REVENUE_SUMMARY: '/stats/revenue/summary',
  STATS_REVENUE_BY_PAYMENT_METHOD: '/stats/revenue/by-payment-method',
  STATS_REVENUE_ORDERS_BY_STATUS: '/stats/revenue/orders/by-status',
  STATS_REVENUE_ORDERS_BY_PAYMENT_STATUS: '/stats/revenue/orders/by-payment-status',
  STATS_REVENUE_ORDERS_FINANCIALS: '/stats/revenue/orders/financials',
  STATS_ORDERS_TREND: '/stats/revenue/orders/trend',
  STATS_PRODUCTS_TOP_SELLING: '/stats/products/top-selling',
  STATS_PRODUCTS_PERFORMANCE: '/stats/products/performance',
  STATS_PRODUCTS_INVENTORY: '/stats/products/inventory',
  STATS_PRODUCTS_VARIANTS_PERFORMANCE: '/stats/products/variants/performance',

  // User Stats
  STATS_USERS_SUMMARY: '/stats/users/summary',
  STATS_USERS_ROLE_DISTRIBUTION: '/stats/users/role-distribution',
  STATS_USERS_TOP_SPENDERS: '/stats/users/top-spenders',
  STATS_USERS_NEW_REGISTRATIONS: '/stats/users/new-registrations',

  // Voucher Stats
  STATS_VOUCHERS_USAGE: '/stats/vouchers/usage',
  STATS_VOUCHERS_EFFECTIVENESS: '/stats/vouchers/effectiveness',

  // Review Stats
  STATS_REVIEWS_SUMMARY: '/stats/reviews/summary',
  STATS_REVIEWS_RATING_DISTRIBUTION: '/stats/reviews/rating-distribution',
  STATS_REVIEWS_BY_PRODUCT: '/stats/reviews/by-product',
};
