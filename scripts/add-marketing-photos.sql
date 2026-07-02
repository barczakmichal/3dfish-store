-- Add marketing photos to 5 accepted products (SKL-110)
-- Appends new marketing image URL to existing images array

UPDATE "Product" SET images = images || ARRAY['https://treefish.pl/products/marketing/crankbait-hunter-7cm-marketing.jpg']
WHERE slug = 'crankbait-hunter-7cm'
  AND NOT ('https://treefish.pl/products/marketing/crankbait-hunter-7cm-marketing.jpg' = ANY(images));

UPDATE "Product" SET images = images || ARRAY['https://treefish.pl/products/marketing/fly-reel-classic-marketing.jpg']
WHERE slug = 'fly-reel-classic-5-6'
  AND NOT ('https://treefish.pl/products/marketing/fly-reel-classic-marketing.jpg' = ANY(images));

UPDATE "Product" SET images = images || ARRAY['https://treefish.pl/products/marketing/panel-organizacyjny-marketing.jpg']
WHERE slug = 'panel-organizacyjny-sprzet'
  AND NOT ('https://treefish.pl/products/marketing/panel-organizacyjny-marketing.jpg' = ANY(images));

UPDATE "Product" SET images = images || ARRAY['https://treefish.pl/products/marketing/uchwyt-serwisowy-kolowrotek-marketing.jpg']
WHERE slug = 'uchwyt-serwisowy-kolowrotek'
  AND NOT ('https://treefish.pl/products/marketing/uchwyt-serwisowy-kolowrotek-marketing.jpg' = ANY(images));

UPDATE "Product" SET images = images || ARRAY['https://treefish.pl/products/marketing/uchwyt-na-wedke-universal-marketing.jpg']
WHERE slug = 'uchwyt-na-wedke-universal'
  AND NOT ('https://treefish.pl/products/marketing/uchwyt-na-wedke-universal-marketing.jpg' = ANY(images));

-- Verify
SELECT slug, images FROM "Product" WHERE slug IN (
  'crankbait-hunter-7cm',
  'fly-reel-classic-5-6',
  'panel-organizacyjny-sprzet',
  'uchwyt-serwisowy-kolowrotek',
  'uchwyt-na-wedke-universal'
);
