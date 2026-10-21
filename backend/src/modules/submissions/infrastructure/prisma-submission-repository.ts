import { Prisma, type PrismaClient } from '@prisma/client';
import type { NewSubmission, SubmissionRepository } from '../domain/submission-repository.js';
import {
  blindIndex,
  decryptSensitive,
  encryptSensitive,
} from '../../../shared/security/encryption.js';

export class PrismaSubmissionRepository implements SubmissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  createSubmission(submission: NewSubmission) {
    const { answers, ...fields } = submission;
    const protectedFields = {
      ...fields,
      contactName: encryptSensitive(fields.contactName),
      contactEmail: encryptSensitive(fields.contactEmail),
      contactPhone: fields.contactPhone ? encryptSensitive(fields.contactPhone) : null,
      city: encryptSensitive(fields.city),
      internalNotes: '',
      answers: encryptSensitive(JSON.stringify(answers)) as Prisma.InputJsonValue,
      contactNameIndex: blindIndex(fields.contactName),
      contactEmailIndex: blindIndex(fields.contactEmail),
    };
    return this.prisma
      .$transaction(async (transaction) => {
        const created = await transaction.submission.create({
          data: {
            ...protectedFields,
            history: { create: { action: 'CREATED', details: 'Demande reçue' } },
          },
          select: { id: true, createdAt: true },
        });
        await transaction.auditLog.create({
          data: { action: 'SUBMISSION_CREATED', entity: 'Submission', entityId: created.id },
        });
        await transaction.notification.createMany({
          data: [
            { kind: 'SUBMISSION_RECEIVED', payload: { submissionId: created.id } },
            { kind: 'SUBMISSION_RECEIPT', payload: { submissionId: created.id } },
          ],
        });
        return created;
      })
      .catch(async (error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          const duplicate = await this.prisma.submission.findUnique({
            where: { idempotencyKey: submission.idempotencyKey },
            select: { id: true, createdAt: true },
          });
          if (duplicate) return duplicate;
        }
        throw error;
      });
  }

  async listAdmin(
    status: NewSubmission['status'] | undefined,
    query: string,
    page: number,
    size: number,
  ): Promise<[unknown[], number]> {
    if (query) {
      const where = status ? { status } : {};
      if (query.includes('@')) {
        const emailIndex = blindIndex(query);
        const emailMatches = await this.prisma.submission.findMany({
          where: { ...where, contactEmailIndex: emailIndex },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * size,
          take: size,
          select: {
            id: true,
            service: true,
            city: true,
            contactName: true,
            status: true,
            createdAt: true,
          },
        });
        const total = await this.prisma.submission.count({
          where: { ...where, contactEmailIndex: emailIndex },
        });
        if (total)
          return [
            emailMatches.map((item) => ({
              ...item,
              city: decryptSensitive(item.city),
              contactName: decryptSensitive(item.contactName),
            })),
            total,
          ] as [unknown[], number];
      }
      return this.prisma.submission
        .findMany({
          where,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            service: true,
            city: true,
            contactName: true,
            contactEmail: true,
            status: true,
            createdAt: true,
          },
        })
        .then((rows) => {
          const normalizedQuery = query.toLocaleLowerCase();
          const matched = rows
            .filter((item) =>
              [
                item.service,
                decryptSensitive(item.city),
                decryptSensitive(item.contactName),
                decryptSensitive(item.contactEmail),
              ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
            )
            .map((item) => ({
              id: item.id,
              service: item.service,
              status: item.status,
              createdAt: item.createdAt,
              city: decryptSensitive(item.city),
              contactName: decryptSensitive(item.contactName),
            }));
          return [matched.slice((page - 1) * size, page * size), matched.length] as [
            unknown[],
            number,
          ];
        });
    }
    const where: Prisma.SubmissionWhereInput = {
      ...(status ? { status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * size,
        take: size,
        select: {
          id: true,
          service: true,
          city: true,
          contactName: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.submission.count({ where }),
    ]);
    return [
      items.map((item) => ({
        ...item,
        city: decryptSensitive(item.city),
        contactName: decryptSensitive(item.contactName),
      })),
      total,
    ];
  }

  async findById(id: string) {
    const item = await this.prisma.submission.findUnique({
      where: { id },
      include: { history: { orderBy: { occurredAt: 'desc' } } },
    });
    if (!item) return null;
    const { contactNameIndex, contactEmailIndex, ...data } = item;
    void contactNameIndex;
    void contactEmailIndex;
    return {
      ...data,
      city: decryptSensitive(item.city),
      contactName: decryptSensitive(item.contactName),
      contactEmail: decryptSensitive(item.contactEmail),
      contactPhone: item.contactPhone ? decryptSensitive(item.contactPhone) : null,
      internalNotes: decryptSensitive(item.internalNotes),
      answers: JSON.parse(
        decryptSensitive(
          typeof item.answers === 'string' ? item.answers : JSON.stringify(item.answers),
        ),
      ) as Prisma.JsonValue,
    };
  }

  async updateAdmin(
    id: string,
    data: { status?: NewSubmission['status']; internalNotes?: string; actorId?: string },
  ) {
    const { actorId, ...fields } = data;
    const protectedFields = {
      ...fields,
      ...(fields.internalNotes !== undefined
        ? { internalNotes: encryptSensitive(fields.internalNotes) }
        : {}),
    };
    const item = await this.prisma.$transaction(async (transaction) => {
      const submission = await transaction.submission.update({
        where: { id },
        data: {
          ...protectedFields,
          history: {
            create: { actorId, action: fields.status ? `STATUS_${fields.status}` : 'NOTE_UPDATED' },
          },
        },
      });
      await transaction.auditLog.create({
        data: {
          actorId,
          action: fields.status ? `SUBMISSION_${fields.status}` : 'SUBMISSION_NOTE_UPDATED',
          entity: 'Submission',
          entityId: id,
        },
      });
      return submission;
    });
    const { contactNameIndex, contactEmailIndex, ...dataWithoutIndexes } = item;
    void contactNameIndex;
    void contactEmailIndex;
    return {
      ...dataWithoutIndexes,
      city: decryptSensitive(item.city),
      contactName: decryptSensitive(item.contactName),
      contactEmail: decryptSensitive(item.contactEmail),
      contactPhone: item.contactPhone ? decryptSensitive(item.contactPhone) : null,
      internalNotes: decryptSensitive(item.internalNotes),
      answers: JSON.parse(
        decryptSensitive(
          typeof item.answers === 'string' ? item.answers : JSON.stringify(item.answers),
        ),
      ) as Prisma.JsonValue,
    };
  }

  async deleteAdmin(id: string, actorId: string) {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.auditLog.updateMany({
        where: { entity: 'Submission', entityId: id },
        data: { entityId: null },
      });
      await transaction.submission.delete({ where: { id } });
      await transaction.auditLog.create({
        data: { actorId, action: 'SUBMISSION_DELETED', entity: 'Submission' },
      });
    });
  }
}
