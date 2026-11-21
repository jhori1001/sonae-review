-- Adds per-product Amazon link overrides, editable from /admin/products.
-- Highest-priority source in lib/affiliates.ts's shopLinks(), ahead of the
-- hardcoded affiliateLinks map and the PA-API-generated amazonLinks.

CREATE TABLE product_overrides (
  product_id text PRIMARY KEY,
  amazon_url text,
  updated_at text NOT NULL
);
