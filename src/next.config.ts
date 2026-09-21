import type { NextConfig } from "next";

// Former sample products were removed; send their old URLs to the matching category.
const oldProducts: Record<string, number> = {
  'toilet-50':0,'lantern-mini':1,'bag-30':2,'power-500':3,'food-rice':4,'battery-10000':5,'water-2l':6,'wipes-80':7,'thermal-sheet':8,
  'firstaid-kit':9,'hand-crank-radio':10,'furniture-strap':11,'foldable-helmet':12,'starter-kit-1p':13,'kids-cushion':14,'women-pouch':15,
  'senior-card':16,'pet-bowl-set':17,
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(oldProducts).map(([id, cat]) => ({ source: `/products/${id}`, destination: `/categories/${cat}`, permanent: true }));
  },
};

export default nextConfig;
