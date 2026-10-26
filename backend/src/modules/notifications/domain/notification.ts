export type NotificationKind = 'SUBMISSION_RECEIVED' | 'SUBMISSION_RECEIPT';
export type NotificationListStatus = 'PENDING' | 'FAILED' | 'SENT';
export type NotificationListFilter = {
  status?: NotificationListStatus;
  query?: string;
  matchingKinds?: NotificationKind[];
};

export interface NotificationRepository {
  list(
    page: number,
    size: number,
    filter?: NotificationListFilter,
  ): Promise<{ items: unknown[]; total: number }>;
  resetFailed(): Promise<void>;
  findPending(now: Date, limit: number): Promise<DispatchableNotification[]>;
  claim(id: string, now: Date): Promise<boolean>;
  findSubmission(id: string): Promise<{ contactEmail: string; service: string } | null>;
  markMissing(id: string): Promise<void>;
  postpone(id: string, until: Date): Promise<void>;
  markSent(id: string, providerId: string | null, sentAt: Date): Promise<void>;
  markFailed(id: string, attempts: number, error: string, availableAt: Date): Promise<void>;
}

export type DispatchableNotification = {
  id: string;
  kind: NotificationKind;
  attempts: number;
  payload: unknown;
};
