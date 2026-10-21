import { decryptSensitive } from '../../../shared/security/encryption.js';
import type { NotificationDispatcher, NotificationRepository } from '../domain/notification.js';

type ResendResponse = { id?: string };

export class ResendNotificationDispatcher implements NotificationDispatcher {
  constructor(private readonly notifications: NotificationRepository) {}

  async dispatchPending(limit = 20): Promise<number> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) return 0;

    let sent = 0;
    const notifications = await this.notifications.findPending(new Date(), limit);
    for (const notification of notifications) {
      if (!(await this.notifications.claim(notification.id, new Date()))) continue;
      try {
        const payload = notification.payload as { submissionId?: string };
        const submission = payload.submissionId
          ? await this.notifications.findSubmission(payload.submissionId)
          : null;
        if (!submission) {
          await this.notifications.markMissing(notification.id);
          continue;
        }

        const receipt = notification.kind === 'SUBMISSION_RECEIPT';
        const recipient = receipt
          ? decryptSensitive(submission.contactEmail)
          : process.env.NOTIFICATION_EMAIL;
        if (!recipient) {
          await this.notifications.postpone(notification.id, new Date(Date.now() + 60 * 60_000));
          continue;
        }

        const body = receipt
          ? {
              from,
              to: [recipient],
              subject: 'Votre demande a bien été reçue — YAA COACHING',
              text: 'Merci pour votre demande. L’équipe YAA COACHING vous recontactera prochainement. Ce message confirme uniquement la réception de votre formulaire.',
            }
          : {
              from,
              to: [recipient],
              subject: 'Nouvelle demande — YAA COACHING',
              text: `Une nouvelle demande (${submission.service}) a été reçue. Connectez-vous à l’administration pour la consulter.`,
            };
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10_000),
        });
        const result = (await response.json().catch(() => ({}))) as ResendResponse;
        if (!response.ok) throw new Error(`Fournisseur e-mail: HTTP ${response.status}`);
        await this.notifications.markSent(notification.id, result.id ?? null, new Date());
        sent += 1;
      } catch (error) {
        const attempts = notification.attempts + 1;
        await this.notifications.markFailed(
          notification.id,
          attempts,
          error instanceof Error ? error.message.slice(0, 500) : 'Erreur fournisseur',
          new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000),
        );
      }
    }
    return sent;
  }
}
