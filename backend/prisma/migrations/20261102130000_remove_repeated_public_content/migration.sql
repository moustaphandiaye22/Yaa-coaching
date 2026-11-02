CREATE FUNCTION "removeRepeatedCoachContent"(source JSONB)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  updated_journey JSONB;
BEGIN
  source := COALESCE(source, '{}'::JSONB);
  IF jsonb_typeof(source->'journey') = 'array' THEN
    SELECT COALESCE(jsonb_agg(item ORDER BY ordinal), '[]'::JSONB)
    INTO updated_journey
    FROM jsonb_array_elements(source->'journey') WITH ORDINALITY AS entry(item, ordinal)
    WHERE item->>'title' IS DISTINCT FROM 'Avec YAA COACHING';
    source := jsonb_set(source, '{journey}', updated_journey, true);
  END IF;
  RETURN source - 'experiences';
END;
$$;

CREATE FUNCTION "removeRepeatedZoneContent"(source JSONB)
RETURNS JSONB
LANGUAGE SQL
AS $$
  SELECT (COALESCE(source, '{}'::JSONB) - 'items') || jsonb_build_object('introduction', '')
$$;

WITH updated_blocks AS (
  UPDATE "ContentBlock"
  SET
    "content" = CASE
      WHEN "key" = 'coach' THEN "removeRepeatedCoachContent"("content")
      WHEN "key" = 'zones' THEN "removeRepeatedZoneContent"("content")
      ELSE "content"
    END,
    "publishedContent" = CASE
      WHEN "publishedContent" IS NULL THEN NULL
      WHEN "key" = 'coach' THEN "removeRepeatedCoachContent"("publishedContent")
      WHEN "key" = 'zones' THEN "removeRepeatedZoneContent"("publishedContent")
      ELSE "publishedContent"
    END,
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" IN ('coach', 'zones')
  RETURNING "id", "key", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'remove-repeats-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'remove-repeats-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'REPEATED_PUBLIC_CONTENT_REMOVED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "removeRepeatedZoneContent"(JSONB);
DROP FUNCTION "removeRepeatedCoachContent"(JSONB);
