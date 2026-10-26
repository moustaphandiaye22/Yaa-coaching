import type {
  NotificationKind,
  NotificationListFilter,
  NotificationListStatus,
  NotificationRepository,
} from '../domain/notification.js';

const notificationSearchLabels: Record<NotificationKind, string> = {
  SUBMISSION_RECEIVED: 'Nouvelle demande reçue',
  SUBMISSION_RECEIPT: 'Confirmation de réception',
};

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR');
}

export class ManageNotifications {
  constructor(private readonly notifications: NotificationRepository) {}

  list(page: number, size: number, filter: { status?: string; query?: string } = {}) {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > 10_000 ||
      !Number.isInteger(size) ||
      size < 1 ||
      size > 50
    ) {
      throw new Error('NOTIFICATION_PAGINATION_INVALID');
    }
    const statuses: NotificationListStatus[] = ['PENDING', 'FAILED', 'SENT'];
    if (filter.status && !statuses.includes(filter.status as NotificationListStatus))
      throw new Error('NOTIFICATION_FILTER_INVALID');
    const query = (filter.query ?? '').trim();
    if (query.length > 120) throw new Error('NOTIFICATION_FILTER_INVALID');
    const normalizedQuery = normalizeSearch(query);
    const matchingKinds = (Object.keys(notificationSearchLabels) as NotificationKind[]).filter(
      (kind) =>
        normalizeSearch(kind).includes(normalizedQuery) ||
        normalizeSearch(notificationSearchLabels[kind]).includes(normalizedQuery),
    );
    const listFilter: NotificationListFilter = {
      ...(filter.status ? { status: filter.status as NotificationListStatus } : {}),
      ...(query ? { query, matchingKinds } : {}),
    };
    return this.notifications.list(page, size, listFilter);
  }
}
