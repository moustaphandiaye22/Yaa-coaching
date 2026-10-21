export type NotificationKind = 'SUBMISSION_RECEIVED' | 'SUBMISSION_RECEIPT';

export interface NotificationDispatcher {
  dispatchPending(limit?: number): Promise<number>;
}
