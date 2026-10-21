import type { PrismaClient } from '@prisma/client';

function configuredDays(name: string, defaultDays: number): number {
  const raw = process.env[name];
  const value = raw === undefined || raw === '' ? defaultDays : Number(raw);
  if (!Number.isInteger(value) || value < 30 || value > 3650) throw new Error(`${name} doit être un nombre de jours entre 30 et 3650.`);
  return value;
}

export function assertProductionPrivacyConfiguration(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!process.env.DATA_ENCRYPTION_KEY) throw new Error('DATA_ENCRYPTION_KEY est obligatoire en production.');
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.NOTIFICATION_EMAIL) {
    throw new Error('RESEND_API_KEY, EMAIL_FROM et NOTIFICATION_EMAIL sont obligatoires en production.');
  }
  configuredDays('SUBMISSION_RETENTION_DAYS', 365);
  configuredDays('REVIEW_EMAIL_RETENTION_DAYS', 90);
}

export async function applyRetentionPolicy(prisma: PrismaClient): Promise<{ submissions: number; reviewEmails: number }> {
  const submissionDays = configuredDays('SUBMISSION_RETENTION_DAYS', 365);
  const reviewEmailDays = configuredDays('REVIEW_EMAIL_RETENTION_DAYS', 90);
  const submissionCutoff = new Date(Date.now() - submissionDays * 86_400_000);
  const reviewCutoff = new Date(Date.now() - reviewEmailDays * 86_400_000);
  return prisma.$transaction(async (transaction) => {
    const oldSubmissions = await transaction.submission.findMany({ where: { createdAt: { lt: submissionCutoff } }, select: { id: true } });
    const ids = oldSubmissions.map(({ id }) => id);
    if (ids.length) {
      await transaction.auditLog.updateMany({ where: { entity: 'Submission', entityId: { in: ids } }, data: { entityId: null } });
      await transaction.submission.deleteMany({ where: { id: { in: ids } } });
    }
    const oldReviews = await transaction.review.findMany({ where: { createdAt: { lt: reviewCutoff }, email: { not: '' } }, select: { id: true } });
    if (oldReviews.length) await transaction.review.updateMany({ where: { id: { in: oldReviews.map(({ id }) => id) } }, data: { email: '', emailIndex: '' } });
    await transaction.notification.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 90 * 86_400_000) } } });
    return { submissions: ids.length, reviewEmails: oldReviews.length };
  });
}
