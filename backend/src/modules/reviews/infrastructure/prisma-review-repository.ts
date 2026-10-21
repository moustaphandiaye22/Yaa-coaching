import type { Prisma, PrismaClient } from '@prisma/client';
import type { NewReview, ReviewRepository } from '../domain/review-repository.js';
import { blindIndex, decryptSensitive, encryptSensitive } from '../../../shared/security/encryption.js';

export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listPublic() {
    return this.prisma.review.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, pseudonym: true, service: true, rating: true, message: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  createPendingReview(review: NewReview) {
    const protectedReview = { ...review, email: encryptSensitive(review.email), emailIndex: blindIndex(review.email) };
    return this.prisma.$transaction(async (transaction) => {
      const created = await transaction.review.create({
        data: protectedReview,
        select: { id: true, status: true },
      });
      await transaction.auditLog.create({ data: { action: 'REVIEW_SUBMITTED', entity: 'Review', entityId: created.id } });
      return created;
    });
  }

  async listAdmin(status?: Prisma.ReviewWhereInput['status']) {
    const items = await this.prisma.review.findMany({ where: status ? { status } : {}, orderBy: { createdAt: 'desc' } });
    return items.map((item) => ({ ...item, email: decryptSensitive(item.email) }));
  }

  async updateStatus(id: string, status: Prisma.ReviewUpdateInput['status'], actorId: string) {
    const review = await this.prisma.$transaction(async (transaction) => {
      const review = await transaction.review.update({ where: { id }, data: { status } });
      await transaction.auditLog.create({ data: { actorId, action: `REVIEW_${status}`, entity: 'Review', entityId: id } });
      return review;
    });
    return { ...review, email: decryptSensitive(review.email) };
  }

  async delete(id: string, actorId: string) {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.review.delete({ where: { id } });
      await transaction.auditLog.create({ data: { actorId, action: 'REVIEW_DELETED', entity: 'Review', entityId: id } });
    });
  }
}
