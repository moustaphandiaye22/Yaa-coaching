CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'TO_CONTACT', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH');
CREATE TYPE "MediaKind" AS ENUM ('PHOTO', 'VIDEO');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "AuthSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");
CREATE INDEX "AuthSession_userId_expiresAt_idx" ON "AuthSession"("userId", "expiresAt");
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

CREATE TABLE "Submission" (
  "id" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "contactPhone" TEXT,
  "answers" JSONB NOT NULL,
  "consentAt" TIMESTAMP(3) NOT NULL,
  "consentVersion" TEXT NOT NULL DEFAULT 'v1',
  "questionnaireVersion" TEXT NOT NULL DEFAULT 'v1',
  "idempotencyKey" TEXT,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
  "internalNotes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Submission_status_createdAt_idx" ON "Submission"("status", "createdAt");
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");
CREATE UNIQUE INDEX "Submission_idempotencyKey_key" ON "Submission"("idempotencyKey");

CREATE TABLE "SubmissionEvent" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubmissionEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SubmissionEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "SubmissionEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "pseudonym" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "message" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  "consentAt" TIMESTAMP(3) NOT NULL,
  "consentVersion" TEXT NOT NULL DEFAULT 'v1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Review_status_createdAt_idx" ON "Review"("status", "createdAt");

CREATE TABLE "Faq" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT TRUE,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Faq_published_position_idx" ON "Faq"("published", "position");

CREATE TABLE "ContentBlock" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "publishedContent" JSONB,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "publishedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ContentBlock_key_key" ON "ContentBlock"("key");

CREATE TABLE "ContentRevision" (
  "id" TEXT NOT NULL,
  "contentBlockId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContentRevision_contentBlockId_fkey" FOREIGN KEY ("contentBlockId") REFERENCES "ContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ContentRevision_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ContentRevision_contentBlockId_revision_key" ON "ContentRevision"("contentBlockId", "revision");
CREATE INDEX "ContentRevision_createdAt_idx" ON "ContentRevision"("createdAt");

CREATE TABLE "Media" (
  "id" TEXT NOT NULL,
  "kind" "MediaKind" NOT NULL,
  "service" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Media_published_position_idx" ON "Media"("published", "position");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "AuditLog_occurredAt_idx" ON "AuditLog"("occurredAt");
