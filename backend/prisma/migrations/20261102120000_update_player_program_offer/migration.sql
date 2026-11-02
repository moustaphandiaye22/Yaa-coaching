CREATE FUNCTION "updatePlayerServiceContent"(source JSONB)
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
        'type', 'JEUNES SPORTIFS · 9–18 ANS',
        'alt', 'Un jeune sportif échange avec un coach à son écoute après une séance.',
        'questionnaireSituations', jsonb_build_array('Être accompagné dans mon parcours de jeune sportif'),
        'presentation', 'Accompagnement individualisé des jeunes sportifs de 9 à 18 ans, toutes disciplines. Le parcours travaille la performance mentale, les habitudes de progression et l’autonomie, en lien avec la discipline et le projet du jeune.',
        'offerHighlight', 'CIBLÉ : 45 € / séance · PERFORMANCE : 60 € / séance',
        'offerDetails', ' Séances individuelles d’une heure, une fois par semaine, sur 3 mois minimum. Le parcours est proposé après le bilan découverte.',
        'description', 'Pour les jeunes sportifs de 9 à 18 ans, toutes disciplines : optimiser la performance mentale, les habitudes de progression et l’autonomie, sans réduire le jeune à ses résultats.'
      );
    END IF;
    updated_items := updated_items || jsonb_build_array(service_item);
  END LOOP;

  RETURN jsonb_set(source, '{items}', updated_items, true);
END;
$$;

CREATE FUNCTION "updatePlayerOverview"(source JSONB)
RETURNS JSONB
LANGUAGE SQL
AS $$
  SELECT COALESCE(source, '{}'::JSONB) || jsonb_build_object(
    'serviceLabel', 'YAA PLAYER',
    'mediaLabel', 'TOUTES DISCIPLINES · 9–18 ANS',
    'eyebrow', 'POUR LES JEUNES SPORTIFS',
    'title', 'Optimiser sa performance mentale.',
    'description', 'YAA PLAYER accompagne les jeunes sportifs de 9 à 18 ans, dans toutes les disciplines, pour optimiser leur performance mentale dans sa globalité : confiance, émotions, concentration, motivation, gestion de la pression et fixation d’objectifs.',
    'audience', 'Le parcours tient aussi compte du sommeil, de la récupération, de l’alimentation, des routines, des études et de l’équilibre de vie. Présentiel ou distance, en français ou en anglais.',
    'tags', jsonb_build_array('MENTAL', 'ENTRAÎNEMENT INVISIBLE', 'ÉTUDES', 'ÉQUILIBRE DE VIE', 'AUTONOMIE'),
    'questionnaireSituation', 'Être accompagné dans mon parcours de jeune sportif',
    'callToAction', 'Faire mon bilan gratuit',
    'note', 'Une séance individuelle d’une heure par semaine · 3 mois minimum.'
  );
$$;

WITH updated_blocks AS (
  UPDATE "ContentBlock"
  SET
    "content" = CASE
      WHEN "key" = 'services' THEN "updatePlayerServiceContent"("content")
      WHEN "key" = 'player' THEN "updatePlayerOverview"("content")
      ELSE "content"
    END,
    "publishedContent" = CASE
      WHEN "publishedContent" IS NULL THEN NULL
      WHEN "key" = 'services' THEN "updatePlayerServiceContent"("publishedContent")
      WHEN "key" = 'player' THEN "updatePlayerOverview"("publishedContent")
      ELSE "publishedContent"
    END,
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" IN ('services', 'player')
  RETURNING "id", "key", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'player-program-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'player-program-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'PLAYER_PROGRAM_CONTENT_UPDATED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "updatePlayerOverview"(JSONB);
DROP FUNCTION "updatePlayerServiceContent"(JSONB);
