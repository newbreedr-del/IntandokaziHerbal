export interface StoreProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  benefits: string[];
  ingredients: string[];
  usage: string;
  emoji: string;
  gradient: string;
  gradient_css: string;
  image?: string;
  badge?: string;
}

// Load products from Supabase API
export async function fetchStoreProducts(): Promise<StoreProduct[]> {
  try {
    const response = await fetch('/api/admin/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    
    // Transform Supabase products to StoreProduct format
    return products.map((product: any) => ({
      id: product.id,
      name: product.name,
      tagline: product.tagline || '',
      description: product.short_description || '',
      longDescription: product.long_description || '',
      category: product.category,
      price: product.price,
      unit: product.unit,
      stock: product.stock_quantity,
      benefits: product.benefits || [],
      ingredients: product.ingredients || [],
      usage: product.usage_instructions || '',
      emoji: product.emoji || '🌿',
      gradient: '', // Can be derived from gradient_css if needed
      gradient_css: product.gradient_css || 'linear-gradient(135deg, #134e4a, #155e75)',
      image: product.image_url || '',
      badge: product.badge || null,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// For backward compatibility, export empty array (will be populated by API call)
export const STORE_PRODUCTS: StoreProduct[] = [];

// Categories will be populated dynamically when products are loaded
export const CATEGORIES = ["All", "Teas", "Skincare", "Tonics", "Oils"];
