-- ============================================================================
-- REBUILD PRODUCTS TABLE - Add Missing Columns + Seed All 18 Products
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create products table with all columns
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  sku TEXT UNIQUE,
  tagline TEXT,
  short_description TEXT,
  description TEXT,
  long_description TEXT,
  category TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  image_url TEXT,
  emoji TEXT,
  gradient_css TEXT,
  badge TEXT,
  benefits TEXT[],
  ingredients TEXT[],
  usage_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT '✅ Products table ready!' as status;

-- Add any columns that may be missing if table already existed
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS emoji TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gradient_css TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_instructions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

SELECT '✅ All columns ensured!' as status;

-- STEP 2: Clear old/placeholder products and insert all 18 real products
-- ============================================================================

DELETE FROM products;

INSERT INTO products (
  name, slug, sku, tagline, short_description, description, long_description,
  category, price, unit, stock_quantity, low_stock_threshold,
  image_url, emoji, gradient_css, badge,
  benefits, ingredients, usage_instructions,
  is_active, is_featured, is_new
) VALUES

-- 1. Imbiza Yamadoda
(
  'Imbiza Yamadoda',
  'imbiza-yamadoda',
  'IH-IY-500ml',
  'Traditional herbal tonic for men''s wellness',
  'A 500ml traditional herbal tonic blend with moringa, African potato, aloe ferox, and cancer bush for general wellness.',
  'A 500ml traditional herbal tonic blend with moringa, African potato, aloe ferox, and cancer bush for general wellness.',
  'Imbiza Yamadoda is a traditional herbal tonic from Intandokazi Herbal, formulated with indigenous herbs including moringa, African potato (Hypoxis), aloe ferox, and cancer bush (Sutherlandia). This general wellness mixture supports vitality and overall health using time-honored African botanical wisdom.',
  'Internal Health',
  800.00, '500ml', 25, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/imbiza-yamadoda.jpg',
  '💪', 'linear-gradient(135deg, #78350f, #9a3412)', 'Traditional',
  ARRAY['Supports general wellness', 'Traditional African botanical blend', 'Rich in indigenous herbs', 'Promotes vitality', 'Natural health support'],
  ARRAY['Moringa', 'African potato (Hypoxis)', 'Aloe ferox', 'Cancer bush (Sutherlandia)', 'Traditional indigenous herbs'],
  'Shake well. Take 2 tablespoons (30ml) twice daily after meals, or as directed by your health practitioner. Refrigerate after opening.',
  true, true, false
),

-- 2. Imbiza yokuchatha
(
  'Imbiza yokuchatha',
  'imbiza-yokuchatha',
  'TH-IY-500ml',
  'Traditional cleansing mixture for lower-body wellness',
  'A 500ml traditional herbal cleansing mixture (ukuchatha) for isichitho sangaphansi - lower-body cleansing and wellness.',
  'A 500ml traditional herbal cleansing mixture (ukuchatha) for isichitho sangaphansi - lower-body cleansing and wellness.',
  'Imbiza yokuchatha is a traditional herbal cleansing mixture from Intandokazi Ukuphila Products, formulated for isichitho sangaphansi (lower-body cleansing). This herbal purgative/enema preparation follows traditional African wellness practices for internal cleansing and balance.',
  'Traditional Healing',
  350.00, '500ml', 20, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/imbiza-yokuchatha.jpg',
  '🌿', 'linear-gradient(135deg, #14532d, #065f46)', NULL,
  ARRAY['Traditional cleansing support', 'Lower-body wellness', 'Herbal purgative preparation', 'Follows traditional practices', 'Internal balance support'],
  ARRAY['Traditional African herbal blend', 'Cleansing botanicals', 'Natural plant extracts'],
  'Mix half a glass of warm water with half a glass of umuthi. Use the mixture for ukuchatha (enema). Repeat twice a week, or as directed by your practitioner.',
  true, false, false
),

-- 3. Stop Nonsense! — Indlovu kayiphendulwa
(
  'Stop Nonsense! — Indlovu kayiphendulwa',
  'stop-nonsense-indlovu-kayiphendulwa',
  'TH-SN-2L',
  'Traditional cleansing mixture for steam/sitz baths',
  'A 2-litre traditional herbal cleansing mixture for ukuchatha (steam/sitz cleansing) - powerful traditional wellness support.',
  'A 2-litre traditional herbal cleansing mixture for ukuchatha (steam/sitz cleansing) - powerful traditional wellness support.',
  'Stop Nonsense! — Indlovu kayiphendulwa is a traditional herbal cleansing mixture from Intandokazi Ukuphila Products, formulated for ukuchatha (steam/sitz cleansing) use. This powerful 2-litre preparation supports traditional African cleansing rituals and wellness practices.',
  'Traditional Healing',
  600.00, '2L', 15, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/stop-nonsense.jpg',
  '🔥', 'linear-gradient(135deg, #7f1d1d, #9a3412)', 'Powerful',
  ARRAY['Powerful traditional cleansing', 'Steam/sitz bath support', 'Large 2-litre size', 'Traditional wellness ritual', 'Deep cleansing properties'],
  ARRAY['Traditional African herbal blend', 'Cleansing botanicals', 'Natural plant extracts'],
  'Pour 2 litres of umuthi into a bucket. Fill with warm water to make approximately 5 litres. Sit over the bucket and steam cleanse. Use 3-4 times a day, after every 2 days, or as directed.',
  true, true, false
),

-- 4. Imbiza yoMhlume
(
  'Imbiza yoMhlume',
  'imbiza-yomhlume',
  'IH-IY-1L',
  'Traditional herbal tonic for internal cleansing',
  'A 1-litre traditional herbal tonic blend formulated for internal cleansing and strengthening.',
  'A 1-litre traditional herbal tonic blend formulated for internal cleansing and strengthening.',
  'Imbiza yoMhlume is a traditional herbal tonic from Intandokazi Ukuphila Products, formulated as an internal cleansing and strengthening mixture. This 1-litre preparation supports digestive wellness and overall vitality using traditional African botanical wisdom.',
  'Internal Health',
  300.00, '1L', 18, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/imbiza-yomhlume.jpg',
  '⚡', 'linear-gradient(135deg, #1e3a8a, #155e75)', NULL,
  ARRAY['Internal cleansing support', 'Strengthening properties', 'Digestive wellness', 'Traditional formulation', 'Supports vitality'],
  ARRAY['Traditional African herbal blend', 'Cleansing botanicals', 'Strengthening plant extracts'],
  'Mix 2 tablespoons in a quarter cup of warm water. Drink three times a day, 30 minutes before meals, or as directed by your practitioner.',
  true, false, false
),

-- 5. Umabulala iDliso (Umlomo Omnandi)
(
  'Umabulala iDliso (Umlomo Omnandi)',
  'umabulala-idliso',
  'TH-UI-1L',
  'Traditional mixture for cleansing related to idliso',
  'A 1-litre traditional herbal mixture formulated for cleansing related to idliso (traditional concept of poison/bad luck).',
  'A 1-litre traditional herbal mixture formulated for cleansing related to idliso (traditional concept of poison/bad luck).',
  'Umabulala iDliso (Umlomo Omnandi) is a traditional herbal mixture from Intandokazi Ukuphila Products, formulated for cleansing related to idliso (traditional concept of poison/bad luck). This preparation follows traditional African wellness practices for spiritual and physical cleansing.',
  'Traditional Healing',
  350.00, '1L', 22, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/umabulala-idliso.jpg',
  '🛡️', 'linear-gradient(135deg, #4c1d95, #5b21b6)', NULL,
  ARRAY['Traditional cleansing support', 'Spiritual wellness', 'Physical cleansing', 'Follows traditional practices', 'Protective properties'],
  ARRAY['Traditional African herbal blend', 'Cleansing botanicals', 'Protective plant extracts'],
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner. Not for use during pregnancy.',
  true, false, false
),

-- 6. Umhlabelo
(
  'Umhlabelo',
  'umhlabelo',
  'WS-U-1L',
  'Traditional herbal wash for home and body cleansing',
  'A 1-litre traditional herbal wash for ukuhlabela (ritual cleansing/washing) of the home and body.',
  'A 1-litre traditional herbal wash for ukuhlabela (ritual cleansing/washing) of the home and body.',
  'Umhlabelo is a traditional herbal wash from Intandokazi Ukuphila Products, formulated for ukuhlabela (ritual cleansing/washing) of the home and body. This preparation supports traditional African cleansing rituals for spiritual protection and wellness.',
  'Wellness & Spiritual',
  250.00, '1L', 28, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/umhlabelo.jpg',
  '🏠', 'linear-gradient(135deg, #134e4a, #155e75)', NULL,
  ARRAY['Home and body cleansing', 'Ritual washing support', 'Spiritual protection', 'Traditional formulation', 'Day and night use'],
  ARRAY['Traditional African herbal blend', 'Cleansing botanicals', 'Protective plant extracts'],
  'Wash/cleanse home and body with warm water, night and day for 7 days, or as directed by your practitioner.',
  true, false, false
),

-- 7. Imbiza Yama-Ulcer
(
  'Imbiza Yama-Ulcer',
  'imbiza-yama-ulcer',
  'IH-IU-1L',
  'Traditional mixture for digestive comfort',
  'A 1-litre traditional herbal mixture formulated to support digestive comfort and general wellness.',
  'A 1-litre traditional herbal mixture formulated to support digestive comfort and general wellness.',
  'Imbiza Yama-Ulcer is a traditional herbal mixture from Intandokazi Ukuphila Products, formulated to support digestive comfort and general wellness. This preparation uses traditional African botanicals known for their soothing and healing properties.',
  'Internal Health',
  300.00, '1L', 16, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/imbiza-yama-ulcer.jpg',
  '💚', 'linear-gradient(135deg, #365314, #166534)', NULL,
  ARRAY['Digestive comfort support', 'Soothing properties', 'General wellness', 'Traditional formulation', 'Natural healing support'],
  ARRAY['Traditional African herbal blend', 'Soothing botanicals', 'Digestive support plant extracts'],
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner. Consult healthcare provider if you have ulcer diagnosis.',
  true, false, false
),

-- 8. Umvusa Nkunzi
(
  'Umvusa Nkunzi',
  'umvusa-nkunzi',
  'IH-UN-1L',
  'Traditional men''s vitality and strength tonic',
  'A 1-litre traditional herbal tonic formulated as a men''s vitality and strength mixture.',
  'A 1-litre traditional herbal tonic formulated as a men''s vitality and strength mixture.',
  'Umvusa Nkunzi is a traditional herbal tonic from Intandokazi Ukuphila Products, formulated as a men''s vitality and strength mixture. This powerful preparation supports male wellness, energy, and vitality using traditional African botanical wisdom.',
  'Internal Health',
  300.00, '1L', 20, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/umvusa-nkunzi.jpg',
  '🦁', 'linear-gradient(135deg, #7c2d12, #92400e)', 'Men''s Health',
  ARRAY['Men''s vitality support', 'Strength and energy', 'Traditional formulation', 'Male wellness', 'Natural vitality boost'],
  ARRAY['Traditional African herbal blend', 'Vitality-supporting botanicals', 'Strengthening plant extracts'],
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner.',
  true, false, false
),

-- 9. Zakhanya Liquid
(
  'Zakhanya Liquid',
  'zakhanya-liquid',
  'IH-ZL-1L',
  'Traditional mixture for wellbeing and vitality',
  'A 1-litre traditional herbal mixture formulated to support general wellbeing and vitality.',
  'A 1-litre traditional herbal mixture formulated to support general wellbeing and vitality.',
  'Zakhanya Liquid is a traditional herbal mixture from Intandokazi Ukuphila Products, formulated to support general wellbeing and vitality. This preparation uses traditional African botanicals to promote health, energy, and overall wellness.',
  'Internal Health',
  100.00, '1L', 24, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/zakhanya-liquid.jpg',
  '✨', 'linear-gradient(135deg, #713f12, #92400e)', NULL,
  ARRAY['General wellbeing support', 'Vitality boost', 'Energy support', 'Traditional formulation', 'Overall wellness'],
  ARRAY['Traditional African herbal blend', 'Vitality-supporting botanicals', 'Wellness plant extracts'],
  'Take 2 tablespoons 3 times a day after meals, or as directed by your practitioner.',
  true, false, false
),

-- 10. Bath Salt (Yokuthandeka)
(
  'Bath Salt (Yokuthandeka)',
  'bath-salt-yokuthandeka',
  'SB-BS-500ml',
  'Herbal bath salt for attractiveness and likability',
  'A 500ml herbal bath salt formulated for cleansing baths and skin care to support ukuthandeka (attractiveness/likability).',
  'A 500ml herbal bath salt formulated for cleansing baths and skin care to support ukuthandeka (attractiveness/likability).',
  'Bath Salt (Yokuthandeka) is a herbal bath salt from Intandokazi Ukuphila Products, formulated for cleansing baths and skin care to support ukuthandeka (attractiveness/likability). This traditional preparation combines cleansing and beautifying properties for a complete wellness experience.',
  'Skin & Body',
  80.00, '500ml', 35, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/yokuthandeka.jpg',
  '💖', 'linear-gradient(135deg, #831843, #9f1239)', 'Beauty',
  ARRAY['Cleansing bath support', 'Skin care properties', 'Attractiveness support', 'Traditional formulation', 'Beautifying properties'],
  ARRAY['Herbal bath salts', 'Traditional botanicals', 'Skin-nourishing minerals'],
  'Apply/rub on the body while bathing, or dissolve desired amount in warm bath water and soak as needed.',
  true, false, false
),

-- 11. Inhlanhla Emhlophe
(
  'Inhlanhla Emhlophe',
  'inhlanhla-emhlophe',
  'WS-IE-500ml',
  'Herbal bath salt for luck and fortune',
  'A 500ml herbal bath salt formulated for cleansing baths associated with inhlanhla (luck/fortune).',
  'A 500ml herbal bath salt formulated for cleansing baths associated with inhlanhla (luck/fortune).',
  'Inhlanhla Emhlophe is a herbal bath salt from Intandokazi Ukuphila Products, formulated for cleansing baths associated with inhlanhla (luck/fortune). This traditional preparation supports spiritual wellness and attracts positive energy.',
  'Wellness & Spiritual',
  80.00, '500ml', 30, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/inhlanhla-emhlophe.jpg',
  '🍀', 'linear-gradient(135deg, #e2e8f0, #d1d5db)', NULL,
  ARRAY['Luck and fortune support', 'Spiritual cleansing', 'Positive energy attraction', 'Traditional formulation', 'Wellness bath'],
  ARRAY['Herbal bath salts', 'Traditional botanicals', 'Fortune-attracting minerals'],
  'Apply/rub on the body while bathing, or dissolve desired amount in warm bath water and soak as needed.',
  true, false, false
),

-- 12. Umakhiphi Isichitho
(
  'Umakhiphi Isichitho',
  'umakhiphi-isichitho',
  'WS-UI-500ml',
  'Herbal bath salt for removing misfortune',
  'A 500ml herbal bath salt formulated for cleansing baths associated with removing isichitho (misfortune/negative energy).',
  'A 500ml herbal bath salt formulated for cleansing baths associated with removing isichitho (misfortune/negative energy).',
  'Umakhiphi Isichitho is a herbal bath salt from Intandokazi Ukuphila Products, formulated for cleansing baths associated with removing isichitho (misfortune/negative energy). This powerful traditional preparation supports spiritual cleansing and protection.',
  'Wellness & Spiritual',
  80.00, '500ml', 28, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/umakhiphi-isichitho.jpg',
  '🛡️', 'linear-gradient(135deg, #312e81, #6d28d9)', 'Protection',
  ARRAY['Removes misfortune', 'Spiritual cleansing', 'Negative energy removal', 'Traditional formulation', 'Protection support'],
  ARRAY['Herbal bath salts', 'Traditional cleansing botanicals', 'Protective minerals'],
  'Apply/rub on the body while bathing, or dissolve desired amount in warm bath water and soak as needed.',
  true, false, false
),

-- 13. Tissue Oil (Eyenenhlannhla)
(
  'Tissue Oil (Eyenenhlannhla)',
  'tissue-oil-eyenenhlannhla',
  'SB-TO-100ml',
  'Herbal tissue oil for luck and skin nourishment',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with inhlanhla (luck/fortune).',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with inhlanhla (luck/fortune).',
  'Tissue Oil (Eyenenhlannhla) is a herbal tissue oil from Intandokazi Ukuphila Products, formulated for skin nourishment and associated with inhlanhla (luck/fortune). This traditional preparation combines skincare benefits with spiritual wellness support.',
  'Skin & Body',
  200.00, '100ml', 40, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/tissue-oil-eyenenhlannhla.jpg',
  '🌟', 'linear-gradient(135deg, #d97706, #eab308)', NULL,
  ARRAY['Skin nourishment', 'Luck and fortune support', 'Moisturizing properties', 'Traditional formulation', 'Spiritual wellness'],
  ARRAY['Herbal tissue oil blend', 'Traditional botanicals', 'Skin-nourishing oils'],
  'Apply when you anoint/rub the whole body. Massage a small amount into clean, dry skin as needed.',
  true, false, false
),

-- 14. Tissue Oil (Yesichitho)
(
  'Tissue Oil (Yesichitho)',
  'tissue-oil-yesichitho',
  'SB-TO-2-100ml',
  'Herbal tissue oil for removing misfortune',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with removing isichitho (misfortune/negative energy).',
  'A 100ml herbal tissue oil formulated for skin nourishment and associated with removing isichitho (misfortune/negative energy).',
  'Tissue Oil (Yesichitho) is a herbal tissue oil from Intandokazi Ukuphila Products, formulated for skin nourishment and associated with removing isichitho (misfortune/negative energy). This traditional preparation combines skincare benefits with spiritual cleansing support.',
  'Skin & Body',
  200.00, '100ml', 38, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/tissue-oil-yesichitho.jpg',
  '🔮', 'linear-gradient(135deg, #4c1d95, #6d28d9)', NULL,
  ARRAY['Skin nourishment', 'Removes misfortune', 'Moisturizing properties', 'Traditional formulation', 'Spiritual cleansing'],
  ARRAY['Herbal tissue oil blend', 'Traditional cleansing botanicals', 'Skin-nourishing oils'],
  'Apply when you anoint/rub the whole body. Massage a small amount into clean, dry skin as needed.',
  true, false, false
),

-- 15. Shower Gel (Ikhipha Isichitho)
(
  'Shower Gel (Ikhipha Isichitho)',
  'shower-gel-ikhipha-isichitho',
  'SB-SG-500ml',
  'Herbal shower gel for removing misfortune',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with removing isichitho (misfortune/negative energy).',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with removing isichitho (misfortune/negative energy).',
  'Shower Gel (Ikhipha Isichitho) is a herbal shower gel from Intandokazi Ukuphila Products, formulated for daily cleansing and associated with removing isichitho (misfortune/negative energy). This traditional preparation combines daily hygiene with spiritual cleansing support.',
  'Skin & Body',
  100.00, '500ml', 32, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/shower-gel-ikhipha-isichitho.jpg',
  '🚿', 'linear-gradient(135deg, #1e3a8a, #3730a3)', NULL,
  ARRAY['Daily cleansing', 'Removes misfortune', 'Gentle on skin', 'Traditional formulation', 'Spiritual cleansing'],
  ARRAY['Herbal shower gel base', 'Traditional cleansing botanicals', 'Gentle cleansing agents'],
  'Wash the whole body. Apply a small amount to wet skin or sponge, lather, then rinse thoroughly.',
  true, false, false
),

-- 16. Shower Gel (Yokuthandeka)
(
  'Shower Gel (Yokuthandeka)',
  'shower-gel-yokuthandeka',
  'SB-SG-2-500ml',
  'Herbal shower gel for love and attraction',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with uthando (love/attraction).',
  'A 500ml herbal shower gel formulated for daily cleansing and associated with uthando (love/attraction).',
  'Shower Gel (Yokuthandeka) is a herbal shower gel from Intandokazi Ukuphila Products, formulated for daily cleansing and associated with uthando (love/attraction). This traditional preparation combines daily hygiene with attractiveness and likability support.',
  'Skin & Body',
  100.00, '500ml', 34, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/shower-gel-yokuthandeka.jpg',
  '💕', 'linear-gradient(135deg, #9f1239, #be123c)', NULL,
  ARRAY['Daily cleansing', 'Love and attraction support', 'Gentle on skin', 'Traditional formulation', 'Beautifying properties'],
  ARRAY['Herbal shower gel base', 'Traditional botanicals', 'Gentle cleansing agents'],
  'Wash the whole body. Apply a small amount to wet skin or sponge, lather, then rinse thoroughly.',
  true, false, false
),

-- 17. Umkhanyakude Jelly (Vaseline)
(
  'Umkhanyakude Jelly (Vaseline)',
  'umkhanyakude-jelly-vaseline',
  'SB-UJ-250ml',
  'Herbal petroleum jelly for skin protection',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications.',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications.',
  'Umkhanyakude Jelly (Vaseline) is a herbal petroleum jelly from Intandokazi Ukuphila Products, used for skin protection, moisturising and traditional applications. This versatile preparation provides deep moisturization and skin barrier protection.',
  'Skin & Body',
  50.00, '250ml', 45, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/umkhanyakude-jelly-vaseline.jpg',
  '🧴', 'linear-gradient(135deg, #164e63, #1e40af)', NULL,
  ARRAY['Skin protection', 'Deep moisturization', 'Barrier protection', 'Traditional formulation', 'Versatile use'],
  ARRAY['Herbal petroleum jelly base', 'Traditional botanicals', 'Moisturizing agents'],
  'Apply a small amount to clean, dry skin and massage gently. Use as needed on hands, feet, elbows, lips or any dry areas.',
  true, false, false
),

-- 18. Umakhiphi Isichitho Vaseline
(
  'Umakhiphi Isichitho Vaseline',
  'umakhiphi-isichitho-vaseline',
  'WS-UI-250ml',
  'Herbal petroleum jelly for removing misfortune',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications associated with removing isichitho.',
  'A 250ml herbal petroleum jelly used for skin protection, moisturising and traditional applications associated with removing isichitho.',
  'Umakhiphi Isichitho Vaseline is a herbal petroleum jelly from Intandokazi Ukuphila Products, used for skin protection, moisturising and traditional applications associated with removing isichitho (misfortune/negative energy). This preparation combines skincare benefits with spiritual cleansing support.',
  'Wellness & Spiritual',
  50.00, '250ml', 42, 5,
  'https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/umakhiphi-isichitho-vaseline.jpg',
  '✨', 'linear-gradient(135deg, #581c87, #3730a3)', NULL,
  ARRAY['Skin protection', 'Removes misfortune', 'Deep moisturization', 'Traditional formulation', 'Spiritual cleansing'],
  ARRAY['Herbal petroleum jelly base', 'Traditional cleansing botanicals', 'Moisturizing agents'],
  'Apply a small amount to clean, dry skin and massage gently. Use as needed on hands, feet, elbows, lips or any dry areas.',
  true, false, false
);

-- STEP 3: Verify
-- ============================================================================

SELECT 
  name, 
  category, 
  price,
  unit,
  stock_quantity,
  is_active,
  is_featured,
  emoji
FROM products 
ORDER BY category, name;

SELECT COUNT(*) as total_products FROM products WHERE is_active = true;
