import type { PrismaClient } from '@prisma/client';
import type { RetentionRepository } from '../application/retention-policy.js';

export class PrismaRetentionRepository implements RetentionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  applyRetention(cutoffs: {
    submissionCutoff: Date;
    reviewCutoff: Date;
    notificationCutoff: Date;
  }) {
    return this.prisma.$transaction(async (transaction) => {
      const oldSubmissions = await transaction.submission.findMany({
        where: { createdAt: { lt: cutoffs.submissionCutoff } },
        select: { id: true },
      });
      const ids = oldSubmissions.map(({ id }) => id);
      if (ids.length) {
        await transaction.auditLog.updateMany({
          where: { entity: 'Submission', entityId: { in: ids } },
          data: { entityId: null },
        });
        await transaction.submission.deleteMany({ where: { id: { in: ids } } });
      }
      const oldReviews = await transaction.review.findMany({
        where: { createdAt: { lt: cutoffs.reviewCutoff }, email: { not: '' } },
        select: { id: true },
      });
      if (oldReviews.length) {
        await transaction.review.updateMany({
          where: { id: { in: oldReviews.map(({ id }) => id) } },
          data: { email: '', emailIndex: '' },
        });
      }
      await transaction.notification.deleteMany({
        where: { createdAt: { lt: cutoffs.notificationCutoff } },
      });
      return { submissions: ids.length, reviewEmails: oldReviews.length };
    });
  }
}
