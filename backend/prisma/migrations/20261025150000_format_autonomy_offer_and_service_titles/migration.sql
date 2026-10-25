CREATE FUNCTION "formatServiceTitlesAndAutonomyOffer"(source JSONB)
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
    CASE service_item->>'slug'
      WHEN 'coaching' THEN
        service_item := service_item || jsonb_build_object('title', 'YAA COACHING');
      WHEN 'player' THEN
        service_item := service_item || jsonb_build_object('title', 'YAA PLAYER');
      WHEN 'autonomie' THEN
        service_item := service_item || jsonb_build_object(
          'title', 'YAA AUTONOMIE',
          'offerHighlight', 'Bouger · Stimuler · Rassurer · Créer du lien.',
          'offerDetails', ' Parcours initial de 12 semaines, avec 2 visites de 45 à 60 minutes par semaine et un bilan initial et final. Proposition personnalisée après échange.'
        );
      ELSE
        NULL;
    END CASE;

    updated_items := updated_items || jsonb_build_array(service_item);
  END LOOP;

  RETURN jsonb_set(source, '{items}', updated_items, true);
END;
$$;

WITH updated_blocks AS (
  UPDATE "ContentBlock"
  SET
    "content" = "formatServiceTitlesAndAutonomyOffer"("content"),
    "publishedContent" = CASE
      WHEN "publishedContent" IS NULL THEN NULL
      ELSE "formatServiceTitlesAndAutonomyOffer"("publishedContent")
    END,
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'services'
    AND jsonb_typeof("content"->'items') = 'array'
  RETURNING "id", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'service-copy-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'service-copy-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'SERVICE_CARD_COPY_ALIGNED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "formatServiceTitlesAndAutonomyOffer"(JSONB);
