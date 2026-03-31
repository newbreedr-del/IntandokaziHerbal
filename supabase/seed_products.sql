-- 🌿 Sample Products for Intandokazi Herbal Products
-- Run this in Supabase SQL Editor after running the main schema.sql

-- Insert sample products
INSERT INTO products (
  name, 
  slug, 
  description, 
  short_description, 
  price, 
  stock_quantity, 
  category, 
  is_active, 
  is_featured,
  emoji,
  gradient_css,
  tags,
  weight_kg,
  dimensions_cm
) VALUES 
-- Herbal Teas
(
  'Traditional Healing Tea',
  'traditional-healing-tea',
  'A powerful blend of traditional African herbs carefully selected for their healing properties. This tea supports immune function, reduces inflammation, and promotes overall wellness. Made from sustainably sourced herbs including African ginger, buchu, and wild sage.',
  'Traditional healing tea blend for immune support and wellness',
  89.99,
  50,
  'Teas',
  true,
  true,
  '🍵',
  'linear-gradient(135deg, #8B4513, #D2691E)',
  'healing, immune, traditional, wellness',
  0.2,
  '{"length": 15, "width": 10, "height": 8}'
),
(
  'Detox & Cleanse Tea',
  'detox-cleanse-tea',
  'Gentle yet effective detoxifying blend that helps cleanse your body naturally. Contains rooibos, honeybush, and dandelion root to support liver function and eliminate toxins. Perfect for a gentle morning reset.',
  'Natural detoxification and cleansing support',
  79.99,
  40,
  'Teas',
  true,
  false,
  '🌿',
  'linear-gradient(135deg, #228B22, #90EE90)',
  'detox, cleanse, liver, morning',
  0.2,
  '{"length": 15, "width": 10, "height": 8}'
),

-- Skincare Products
(
  'Radiant Glow Face Cream',
  'radiant-glow-face-cream',
  'Luxurious face cream infused with marula oil, baobab extract, and aloe vera. This lightweight formula nourishes and hydrates your skin while reducing fine lines. Perfect for all skin types, including sensitive skin.',
  'Nourishing face cream for radiant, healthy skin',
  149.99,
  30,
  'Skincare',
  true,
  true,
  '✨',
  'linear-gradient(135deg, #FFB6C1, #FFC0CB)',
  'face, moisturizer, anti-aging, natural',
  0.05,
  '{"length": 5, "width": 5, "height": 4}'
),
(
  'Healing Body Balm',
  'healing-body-balm',
  'Multipurpose healing balm for dry skin, minor cuts, and skin irritations. Made with shea butter, coconut oil, and traditional African healing herbs. Provides deep moisture and promotes skin regeneration.',
  'Multipurpose healing balm for skin repair',
  119.99,
  35,
  'Skincare',
  true,
  false,
  '🌸',
  'linear-gradient(135deg, #DDA0DD, #E6E6FA)',
  'balm, healing, dry skin, multipurpose',
  0.1,
  '{"length": 6, "width": 6, "height": 3}'
),

-- Herbal Tonics
(
  'Immune Boost Tonic',
  'immune-boost-tonic',
  'Potent immune-boosting tonic formulated with African potato, echinacea, and vitamin C-rich herbs. This liquid supplement helps strengthen your immune system and fight off infections naturally.',
  'Powerful immune system support tonic',
  129.99,
  25,
  'Tonics',
  true,
  true,
  '💪',
  'linear-gradient(135deg, #FF6347, #FFA500)',
  'immune, tonic, liquid, supplement',
  0.25,
  '{"length": 8, "width": 8, "height": 12}'
),
(
  'Stress Relief Tonic',
  'stress-relief-tonic',
  'Calming herbal tonic to help manage stress and anxiety. Contains valerian root, chamomile, and lemon balm in a pleasant-tasting liquid formula. Take before bed or during stressful times.',
  'Natural stress and anxiety relief',
  139.99,
  20,
  'Tonics',
  true,
  false,
  '😌',
  'linear-gradient(135deg, #9370DB, #BA55D3)',
  'stress, anxiety, sleep, calming',
  0.25,
  '{"length": 8, "width": 8, "height": 12}'
),

-- Herbal Supplements
(
  'Energy Boost Capsules',
  'energy-boost-capsules',
  'Natural energy boost without the crash. These capsules contain guarana, green tea extract, and B vitamins for sustained energy throughout the day. Perfect for busy professionals and students.',
  'Natural energy enhancement supplement',
  99.99,
  45,
  'Supplements',
  true,
  false,
  '⚡',
  'linear-gradient(135deg, #FFD700, #FFA500)',
  'energy, focus, capsules, natural',
  0.15,
  '{"length": 10, "width": 6, "height": 4}'
),
(
  'Joint Support Formula',
  'joint-support-formula',
  'Advanced joint support supplement with glucosamine, chondroitin, and turmeric. Helps reduce joint pain and improve mobility. Ideal for active individuals and those with joint discomfort.',
  'Comprehensive joint health support',
  159.99,
  30,
  'Supplements',
  true,
  false,
  '🦴',
  'linear-gradient(135deg, #4682B4, #87CEEB)',
  'joints, mobility, anti-inflammatory, turmeric',
  0.2,
  '{"length": 10, "width": 6, "height": 4}'
),

-- Herbal Oils
(
  'Lavender Essential Oil',
  'lavender-essential-oil',
  'Pure lavender essential oil distilled from locally grown lavender flowers. Perfect for aromatherapy, relaxation, and promoting better sleep. Can be used in diffusers, massage oils, or added to bath water.',
  'Pure lavender oil for relaxation and aromatherapy',
  89.99,
  60,
  'Oils',
  true,
  true,
  '💜',
  'linear-gradient(135deg, #9370DB, #E6E6FA)',
  'lavender, essential oil, aromatherapy, sleep',
  0.01,
  '{"length": 3, "width": 3, "height": 8}'
),
(
  'Eucalyptus Healing Oil',
  'eucalyptus-healing-oil',
  'Therapeutic eucalyptus oil for respiratory support and muscle relief. Excellent for steam inhalation during colds or as a massage oil for sore muscles. 100% pure and undiluted.',
  'Therapeutic eucalyptus oil for respiratory health',
  79.99,
  40,
  'Oils',
  true,
  false,
  '🌬️',
  'linear-gradient(135deg, #008000, #90EE90)',
  'eucalyptus, respiratory, muscle, therapeutic',
  0.01,
  '{"length": 3, "width": 3, "height": 8}'
);

-- Create product images placeholder (you'll update these with actual image URLs)
UPDATE products SET 
  image_url = 'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/placeholder.jpg',
  gallery_images = '["https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/product-images/placeholder.jpg"]'
WHERE image_url IS NULL;

-- Verify products were created
SELECT COUNT(*) as total_products FROM products WHERE is_active = true;

-- Show sample of created products
SELECT 
  name, 
  price, 
  category, 
  stock_quantity,
  is_featured,
  emoji
FROM products 
WHERE is_active = true 
ORDER BY is_featured DESC, name;

-- Note: You'll need to upload actual product images to the storage bucket
-- and update the image_url fields with the correct URLs
