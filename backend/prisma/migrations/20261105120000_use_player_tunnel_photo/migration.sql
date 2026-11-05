CREATE FUNCTION "replacePlayerDefaultImage"(source JSONB)
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
    IF service_item->>'slug' = 'player'
      AND service_item->>'image' = '/images/player.webp' THEN
      service_item := service_item || jsonb_build_object(
        'image', '/images/player-multisport.jpg',
        'alt', 'Un coach échange avec trois jeunes sportifs pratiquant le tennis et le basket.'
      );
    END IF;
    updated_items := updated_items || jsonb_build_array(service_item);
  END LOOP;

  RETURN jsonb_set(source, '{items}', updated_items, true);
END;
$$;

UPDATE "Media"
SET
  "url" = '/images/player-multisport.jpg',
  "alt" = 'Un coach échange avec trois jeunes sportifs pratiquant le tennis et le basket.',
  "caption" = 'YAA PLAYER : un accompagnement pour les jeunes sportifs de toutes disciplines.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "service" = 'YAA PLAYER'
  AND "url" = '/images/player.webp';

WITH updated_blocks AS (
  UPDATE "ContentBlock"
  SET
    "content" = "replacePlayerDefaultImage"("content"),
    "publishedContent" = "replacePlayerDefaultImage"("publishedContent"),
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'services'
    AND (
      "content"::TEXT LIKE '%/images/player.webp%'
      OR "publishedContent"::TEXT LIKE '%/images/player.webp%'
    )
  RETURNING "id", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'player-photo-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'player-photo-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'PLAYER_PHOTO_UPDATED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "replacePlayerDefaultImage"(JSONB);
