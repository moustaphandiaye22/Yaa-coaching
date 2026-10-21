import type { ReviewStatus } from './review-status.js';

export type NewReview = {
  pseudonym: string;
  service: string;
  rating: number;
  message: string;
  email: string;
  consentAt: Date;
  consentVersion: string;
  status: ReviewStatus;
};

export interface ReviewRepository {
  createPendingReview(review: NewReview): Promise<{ id: string; status: ReviewStatus }>;
  listPublic(): Promise<unknown[]>;
  listAdmin(status?: ReviewStatus): Promise<unknown[]>;
  updateStatus(id: string, status: ReviewStatus, actorId: string): Promise<unknown>;
  delete(id: string, actorId: string): Promise<void>;
}
