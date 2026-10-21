import type { PrismaClient } from '@prisma/client';
import { decryptSensitive } from '../../../shared/security/encryption.js';
import type { NotificationDispatcher } from '../domain/notification.js';

type ResendResponse = { id?: string };

export class ResendNotificationDispatcher implements NotificationDispatcher {
  constructor(private readonly prisma: PrismaClient) {}

  async dispatchPending(limit = 20): Promise<number> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) return 0;
    const now = new Date();
    const pending = await this.prisma.notification.findMany({
      where: { sentAt: null, attempts: { lt: 8 }, availableAt: { lte: now }, OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] },
      orderBy: { createdAt: 'asc' }, take: limit,
    });
    let sent = 0;
    for (const notification of pending) {
      const claimed = await this.prisma.notification.updateMany({
        where: { id: notification.id, sentAt: null, attempts: { lt: 8 }, availableAt: { lte: new Date() }, OR: [{ lockedUntil: null }, { lockedUntil: { lte: new Date() } }] },
        data: { lockedUntil: new Date(Date.now() + 2 * 60_000) },
      });
      if (claimed.count === 0) continue;
      try {
        const data = notification.payload as { submissionId?: string };
        const submission = data.submissionId
          ? await this.prisma.submission.findUnique({ where: { id: data.submissionId } })
          : null;
        if (!submission) {
          await this.prisma.notification.update({ where: { id: notification.id }, data: { attempts: 8, lockedUntil: null, lastError: 'La demande associée a été supprimée.' } });
          continue;
        }
        const receipt = notification.kind === 'SUBMISSION_RECEIPT';
        const recipient = receipt ? decryptSensitive(submission.contactEmail) : process.env.NOTIFICATION_EMAIL;
        if (!recipient) {
          await this.prisma.notification.update({ where: { id: notification.id }, data: { lockedUntil: null, availableAt: new Date(Date.now() + 60 * 60_000) } });
          continue;
        }
        const body = receipt
          ? { from, to: [recipient], subject: 'Votre demande a bien été reçue — YAA COACHING', text: 'Merci pour votre demande. L’équipe YAA COACHING vous recontactera prochainement. Ce message confirme uniquement la réception de votre formulaire.' }
          : { from, to: [recipient], subject: 'Nouvelle demande — YAA COACHING', text: `Une nouvelle demande (${submission.service}) a été reçue. Connectez-vous à l’administration pour la consulter.` };
        const result = await fetch('https://api.resend.com/emails', {
          method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
          signal: AbortSignal.timeout(10_000),
        });
        const responseBody = await result.json().catch(() => ({})) as ResendResponse;
        if (!result.ok) throw new Error(`Fournisseur e-mail: HTTP ${result.status}`);
        await this.prisma.notification.update({ where: { id: notification.id }, data: { sentAt: new Date(), lockedUntil: null, providerId: responseBody.id ?? null, lastError: null } });
        sent += 1;
      } catch (error) {
        const attempts = notification.attempts + 1;
        await this.prisma.notification.update({
          where: { id: notification.id },
          data: { attempts, lockedUntil: null, lastError: error instanceof Error ? error.message.slice(0, 500) : 'Erreur fournisseur', availableAt: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000) },
        });
      }
    }
    return sent;
  }
}
