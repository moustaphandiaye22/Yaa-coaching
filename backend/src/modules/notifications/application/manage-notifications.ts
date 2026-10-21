import type { NotificationDispatcher, NotificationRepository } from '../domain/notification.js';

export class ManageNotifications {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  list(page: number, size: number) {
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
    return this.notifications.list(page, size);
  }
  async retry() {
    await this.notifications.resetFailed();
    return this.dispatcher.dispatchPending(50);
  }
}
