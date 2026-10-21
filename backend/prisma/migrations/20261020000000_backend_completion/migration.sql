ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "Submission" ADD COLUMN "contactNameIndex" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Submission" ADD COLUMN "contactEmailIndex" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Review" ADD COLUMN "emailIndex" TEXT NOT NULL DEFAULT '';

CREATE INDEX "Submission_contactNameIndex_idx" ON "Submission"("contactNameIndex");
CREATE INDEX "Submission_contactEmailIndex_idx" ON "Submission"("contactEmailIndex");
CREATE INDEX "Review_emailIndex_idx" ON "Review"("emailIndex");

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedUntil" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "providerId" TEXT,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_sentAt_availableAt_createdAt_idx" ON "Notification"("sentAt", "availableAt", "createdAt");
