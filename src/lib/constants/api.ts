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
  STATS_PRODUCTS_TOP_SELLING: '/stats/products/top-selling',
  STATS_PRODUCTS_PERFORMANCE: '/stats/products/performance',
  STATS_PRODUCTS_INVENTORY: '/stats/products/inventory',
  STATS_PRODUCTS_VARIANTS_PERFORMANCE: '/stats/products/variants/performance',
};
