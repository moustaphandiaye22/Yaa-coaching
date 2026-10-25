CREATE FUNCTION "formatCoachingOfferHighlight"(source JSONB)
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
    IF service_item->>'slug' = 'coaching' THEN
      service_item := service_item || jsonb_build_object(
        'offerHighlight', '140 € les 2 séances',
        'offerDetails', ' (70 € par séance). Repère sur 3 mois : 6 séances, soit 420 €. Le rythme est défini ensemble.'
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
    "content" = "formatCoachingOfferHighlight"("content"),
    "publishedContent" = CASE
      WHEN "publishedContent" IS NULL THEN NULL
      ELSE "formatCoachingOfferHighlight"("publishedContent")
    END,
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'services'
    AND jsonb_typeof("content"->'items') = 'array'
  RETURNING "id", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'coaching-offer-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'coaching-offer-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'COACHING_OFFER_PRICE_FORMATTED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "formatCoachingOfferHighlight"(JSONB);
