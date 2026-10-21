import type { Prisma, PrismaClient } from '@prisma/client';
import type { FaqRepository } from '../domain/faq-repository.js';

export class PrismaFaqRepository implements FaqRepository {
  constructor(private readonly prisma: PrismaClient) {}
  listPublic() { return this.prisma.faq.findMany({ where: { published: true }, orderBy: { position: 'asc' } }); }
  listAdmin() { return this.prisma.faq.findMany({ orderBy: { position: 'asc' } }); }
  create(data: Prisma.FaqCreateInput, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const faq = await transaction.faq.create({ data });
      await transaction.auditLog.create({ data: { actorId, action: 'FAQ_CREATED', entity: 'Faq', entityId: faq.id } });
      return faq;
    });
  }
  update(id: string, data: Prisma.FaqUpdateInput, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const faq = await transaction.faq.update({ where: { id }, data });
      await transaction.auditLog.create({ data: { actorId, action: 'FAQ_UPDATED', entity: 'Faq', entityId: id } });
      return faq;
    });
  }
  async delete(id: string, actorId: string) {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.faq.delete({ where: { id } });
      await transaction.auditLog.create({ data: { actorId, action: 'FAQ_DELETED', entity: 'Faq', entityId: id } });
    });
  }
}
