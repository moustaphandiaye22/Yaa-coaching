WITH updated_blocks AS (
  UPDATE "ContentBlock"
  SET
    "content" = CASE
      WHEN "content"->>'eyebrow' = 'COACHING · FOOTBALL · AUTONOMIE'
      THEN jsonb_set("content", '{eyebrow}', '"COACHING · PLAYER · AUTONOMIE"'::JSONB)
      ELSE "content"
    END,
    "publishedContent" = CASE
      WHEN "publishedContent"->>'eyebrow' = 'COACHING · FOOTBALL · AUTONOMIE'
      THEN jsonb_set("publishedContent", '{eyebrow}', '"COACHING · PLAYER · AUTONOMIE"'::JSONB)
      ELSE "publishedContent"
    END,
    "revision" = "revision" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'hero'
    AND (
      "content"->>'eyebrow' = 'COACHING · FOOTBALL · AUTONOMIE'
      OR "publishedContent"->>'eyebrow' = 'COACHING · FOOTBALL · AUTONOMIE'
    )
  RETURNING "id", "revision", "content"
), inserted_revisions AS (
  INSERT INTO "ContentRevision" ("id", "contentBlockId", "revision", "content")
  SELECT
    'hero-label-' || md5(random()::TEXT || clock_timestamp()::TEXT || "id"),
    "id",
    "revision",
    "content"
  FROM updated_blocks
  RETURNING "contentBlockId"
)
INSERT INTO "AuditLog" ("id", "action", "entity", "entityId")
SELECT
  'hero-label-' || md5(random()::TEXT || clock_timestamp()::TEXT || "contentBlockId"),
  'HERO_SERVICE_LABELS_ALIGNED',
  'ContentBlock',
  "contentBlockId"
FROM inserted_revisions;

UPDATE "Faq"
SET
  "answer" = REPLACE("answer", 'jeunes footballeurs', 'jeunes sportifs'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "question" = 'Où et sous quel format peut-on être accompagné ?'
  AND "answer" LIKE '%jeunes footballeurs%';

UPDATE "Faq"
SET
  "answer" = 'Le parcours commence par un questionnaire découverte, puis un entretien gratuit et sans engagement. Nous définissons ensuite ensemble les priorités, le format et les modalités de l’accompagnement.',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "question" = 'Comment se déroule le début du parcours ?'
  AND "answer" = 'Le parcours commence par un entretien découverte. Il permet de faire le point, puis de définir ensemble les priorités, le format et les modalités de l’accompagnement.';
