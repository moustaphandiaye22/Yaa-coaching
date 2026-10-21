import type { PrismaClient } from '@prisma/client';
import type { MediaChanges, MediaRepository, NewMedia } from '../domain/media-repository.js';

export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  list(publishedOnly: boolean) {
    return this.prisma.media.findMany({
      where: publishedOnly ? { published: true } : {},
      orderBy: { position: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  create(data: NewMedia, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const media = await transaction.media.create({ data });
      await transaction.auditLog.create({ data: { actorId, action: 'MEDIA_CREATED', entity: 'Media', entityId: media.id } });
      return media;
    });
  }

  update(id: string, data: MediaChanges, actorId: string) {
    return this.prisma.$transaction(async (transaction) => {
      const media = await transaction.media.update({ where: { id }, data });
      await transaction.auditLog.create({ data: { actorId, action: 'MEDIA_UPDATED', entity: 'Media', entityId: id } });
      return media;
    });
  }

  async delete(id: string, actorId: string) {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.media.delete({ where: { id } });
      await transaction.auditLog.create({ data: { actorId, action: 'MEDIA_DELETED', entity: 'Media', entityId: id } });
    });
  }
}
