CREATE FUNCTION "mergeServiceOfferCopy"(source JSONB)
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
        service_item := service_item || jsonb_build_object(
          'link', 'Faire mon bilan découverte →',
          'presentation', 'Accompagnement physique et mental individualisé pour reprendre une activité, développer votre confiance et avancer dans votre quotidien.',
          'offerDetails', '140 € les 2 séances (70 € par séance). Repère sur 3 mois : 6 séances, soit 420 €. Le rythme est défini ensemble.'
        );
      WHEN 'player' THEN
        service_item := service_item || jsonb_build_object(
          'link', 'Découvrir YAA PLAYER →',
          'presentation', 'Accompagnement individualisé du jeune footballeur de 9 à 18 ans. Technique, tactique, physique, mental et bien-être : les priorités sont définies avec le joueur.',
          'offerDetails', 'CIBLÉ : 12 semaines, 390 € ; ÉVOLUTION : 16 semaines, 520 € ; OPTIMISATION : 20 semaines, 650 €. CIBLÉ payable en 1 × 390 €, 2 × 195 € ou 3 × 130 €. Un bilan permet de décider de la suite.'
        );
      WHEN 'autonomie' THEN
        service_item := service_item || jsonb_build_object(
          'link', 'Découvrir YAA AUTONOMIE →',
          'presentation', 'Accompagnement personnalisé à domicile pour les personnes âgées ou en perte d’autonomie, à Vierzon et aux alentours.',
          'offerDetails', 'Bouger · Stimuler · Rassurer · Créer du lien. Parcours initial de 12 semaines, avec 2 visites de 45 à 60 minutes par semaine et un bilan initial et final. Proposition personnalisée après échange.'
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
    "content" = "mergeServiceOfferCopy"("content"),
    "publishedContent" = CASE
      WHEN "publishedContent" IS NULL THEN NULL
      ELSE "mergeServiceOfferCopy"("publishedContent")
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
  'SERVICE_OFFER_COPY_INTEGRATED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

DROP FUNCTION "mergeServiceOfferCopy"(JSONB);
