import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  stock_quantity: number;
  category: string;
  is_active: boolean;
  is_featured: boolean;
  emoji: string;
  gradient_css: string;
  tags: string[];
  weight_kg: number;
  dimensions_cm: Record<string, number>;
  image_url?: string;
  gallery_images?: string[];
  created_at?: string;
  updated_at?: string;
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
