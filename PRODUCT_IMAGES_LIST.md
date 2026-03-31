# Product Images - Slug Reference

All images are located in `/public/images/products/` and Supabase bucket "Intandokazi Products"

## Image Files (27 total)

| Slug (Filename without extension) | Full Filename | Size |
|-----------------------------------|---------------|------|
| imbiza-yama-ulcer | imbiza-yama-ulcer.jpeg | 1.8 MB |
| imbiza-yamadoda | imbiza-yamadoda.jpeg | 1.6 MB |
| imbiza-yokuchata | imbiza-yokuchata.jpeg | 2.1 MB |
| imbiza-yomhlume | imbiza-yomhlume.jpeg | 1.9 MB |
| inhlanhla-emhlophe | inhlanhla-emhlophe.jpeg | 2.1 MB |
| inhlasohla-emplasmeni | inhlasohla-emplasmeni.jpg | 149 KB |
| intandokazi-aakhanya-liquid | intandokazi-aakhanya-liquid.jpg | 168 KB |
| intandokazi-yothando | intandokazi-yothando.jpg | 245 KB |
| intanmorati-body-butter | intanmorati-body-butter.jpg | 133 KB |
| intanmorati-mandi-voni | intanmorati-mandi-voni.jpg | 138 KB |
| mavula-kuvaliwe-pouches | mavula-kuvaliwe-pouches.jpg | 126 KB |
| mavula-kuvaliwe-scrub | mavula-kuvaliwe-scrub.jpg | 149 KB |
| mavula-kuvulle-liquid | mavula-kuvulle-liquid.png | 1.6 MB |
| natures-essence-soaps | natures-essence-soaps.jpg | 230 KB |
| shower-gel-ikhipha-isichitho | shower-gel-ikhipha-isichitho.jpeg | 2.0 MB |
| shower-gel-yokuthandeka | shower-gel-yokuthandeka.jpeg | 2.1 MB |
| stop-nonsence | stop-nonsence.jpeg | 2.1 MB |
| tissue-oil-eyenenhlannhla | tissue-oil-eyenenhlannhla.jpeg | 2.2 MB |
| tissue-oil-yesichitho | tissue-oil-yesichitho.jpeg | 2.1 MB |
| umabulala-idliso | umabulala-idliso.jpeg | 2.0 MB |
| umakhiphi-isichitho-vaseline | umakhiphi-isichitho-vaseline.jpeg | 2.1 MB |
| umakhiphi-isichitho | umakhiphi-isichitho.jpeg | 2.1 MB |
| umhlabelo | umhlabelo.jpeg | 2.0 MB |
| umkhanyakude-jelly-vaseline | umkhanyakude-jelly-vaseline.jpeg | 2.0 MB |
| umvusa-nkunizi | umvusa-nkunizi.jpeg | 2.1 MB |
| yokuthandeka | yokuthandeka.jpeg | 2.0 MB |
| zakhanyisa-liquid | zakhanyisa-liquid.jpeg | 2.0 MB |

## Usage Instructions

### When Adding Products in Admin Panel:

1. **Product Slug**: Use the slug from the first column above
2. **Image URL**: Will be automatically generated as:
   ```
   https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/{slug}.jpg
   ```

### Example:
- Product Name: "Imbiza Yamadoda"
- Slug: `imbiza-yamadoda`
- Image File: `imbiza-yamadoda.jpeg`
- Generated URL: `https://oaeirdgffwodkbcstdfh.supabase.co/storage/v1/object/public/Intandokazi Products/imbiza-yamadoda.jpeg`

### Upload to Supabase:

These images need to be uploaded to your Supabase Storage bucket "Intandokazi Products" with the exact same filenames as listed above.

### File Format Support:
- `.jpg` / `.jpeg` - Supported ✓
- `.png` - Supported ✓
- `.webp` - Supported ✓

## Notes:
- All images are properly named with slug-based naming
- One image was renamed: `imbiza-yama-ulcer-.jpeg` → `imbiza-yama-ulcer.jpeg` (removed trailing dash)
- Images are ready to be uploaded to Supabase Storage
