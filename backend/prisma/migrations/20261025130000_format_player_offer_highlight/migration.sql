CREATE FUNCTION "formatPlayerOfferHighlight"(source JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  service_item JSONB;
  updated_items JSONB := '[]'::JSONB;
BEGIN
  IF source IS NULL OR jsonb_typeof(source->'items') <> 'array' THEN
    RETURN source;
  END IF;

  FOR service_item IN SELECT value FROM jsonb_array_elements(source->'items') LOOP
    IF service_item->>'slug' = 'player' THEN
      service_item := service_item || jsonb_build_object(
        'title', 'YAA PLAYER',
        'offerHighlight', 'CIBLÉ : 12 semaines, 390 € ; ÉVOLUTION : 16 semaines, 520 € ; OPTIMISATION : 20 semaines, 650 €.',
        'offerDetails', 'CIBLÉ payable en 1 × 390 €, 2 × 195 € ou 3 × 130 €. Un bilan permet de décider de la suite.'
      );
    END IF;

    updated_items := updated_items || jsonb_build_array(service_item);
  END LOOP;

  RETURN jsonb_set(source, '{items}', updated_items, true);
END;
$$;

WITH updated_blocks AS (
  UPDATE "ContentBlock"
  SET
    "content" = "formatPlayerOfferHighlight"("content"),
    "publishedContent" = CASE
      WHEN "publishedContent" IS NULL THEN NULL
      ELSE "formatPlayerOfferHighlight"("publishedContent")
    END,
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'services'
    AND jsonb_typeof("content"->'items') = 'array'
  RETURNING "id", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'player-offer-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'player-offer-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'PLAYER_OFFER_PRICE_FORMATTED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "formatPlayerOfferHighlight"(JSONB);
