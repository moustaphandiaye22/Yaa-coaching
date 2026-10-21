import { Prisma, type PrismaClient } from '@prisma/client';
import type { ContentRepository } from '../domain/content-repository.js';

export class PrismaContentRepository implements ContentRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async listPublic() {
    const blocks = await this.prisma.contentBlock.findMany({
      where: { publishedAt: { not: null }, publishedContent: { not: Prisma.DbNull } },
      orderBy: { key: 'asc' },
      select: { key: true, publishedContent: true, revision: true, publishedAt: true },
    });
    return blocks.map(({ publishedContent, ...block }) => ({ ...block, content: publishedContent }));
  }
  listAdmin() { return this.prisma.contentBlock.findMany({ orderBy: { key: 'asc' } }); }
  preview(key: string) {
    return this.prisma.contentBlock.findUnique({ where: { key }, select: { key: true, content: true, revision: true, publishedAt: true, updatedAt: true } });
  }
  listRevisions(key: string) {
    return this.prisma.contentRevision.findMany({
      where: { contentBlock: { key } },
      orderBy: { revision: 'desc' },
      select: { id: true, revision: true, content: true, createdAt: true, actor: { select: { email: true } } },
    });
  }
  async save(key: string, content: Record<string, unknown>, publish: boolean, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const block = await transaction.contentBlock.upsert({
        where: { key },
        update: {
          content: content as unknown as Prisma.InputJsonObject,
          revision: { increment: 1 },
          ...(publish ? { publishedContent: content as unknown as Prisma.InputJsonObject, publishedAt: new Date() } : {}),
        },
        create: {
          key,
          content: content as unknown as Prisma.InputJsonObject,
          revision: 1,
          ...(publish ? { publishedContent: content as unknown as Prisma.InputJsonObject, publishedAt: new Date() } : {}),
        },
      });
      await transaction.contentRevision.create({
        data: {
          contentBlockId: block.id,
          revision: block.revision,
          content: content as unknown as Prisma.InputJsonObject,
          actorId,
        },
      });
      await transaction.auditLog.create({ data: { actorId, action: publish ? 'CONTENT_PUBLISHED' : 'CONTENT_UPDATED', entity: 'ContentBlock', entityId: block.id } });
      return block;
    });
  }

  unpublish(key: string, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const block = await transaction.contentBlock.update({
        where: { key },
        data: { publishedContent: Prisma.DbNull, publishedAt: null },
      });
      await transaction.auditLog.create({ data: { actorId, action: 'CONTENT_UNPUBLISHED', entity: 'ContentBlock', entityId: block.id } });
      return block;
    });
  }
}
