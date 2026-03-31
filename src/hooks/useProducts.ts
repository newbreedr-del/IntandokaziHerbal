import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  tagline: string;
  short_description: string;
  description: string;
  long_description: string;
  category: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  unit: string;
  stock_quantity: number;
  low_stock_threshold: number;
  weight_kg?: number;
  dimensions_cm?: Record<string, number>;
  image_url?: string;
  gallery_images?: string[];
  emoji: string;
  gradient_css: string;
  badge?: string;
  benefits: string[];
  ingredients: string[];
  usage_instructions: string;
  warnings?: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  view_count: number;
  purchase_count: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface ProductsResponse {
  products: Product[];
  error?: string;
  details?: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/products');
        const data: ProductsResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch products');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}
