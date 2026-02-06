/*
  # Add marketplace_links columns

  1. New Columns
    - `components.marketplace_links` (jsonb)
    - `monitors.marketplace_links` (jsonb)

  2. Backfill (components)
    - If legacy `marketplace_link` exists, copy into `marketplace_links.shopee`
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'components' AND column_name = 'marketplace_links'
  ) THEN
    ALTER TABLE components ADD COLUMN marketplace_links JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'monitors' AND column_name = 'marketplace_links'
  ) THEN
    ALTER TABLE monitors ADD COLUMN marketplace_links JSONB;
  END IF;
END $$;

UPDATE components
SET marketplace_links = jsonb_build_object('shopee', marketplace_link)
WHERE marketplace_links IS NULL
  AND marketplace_link IS NOT NULL
  AND marketplace_link <> '';
