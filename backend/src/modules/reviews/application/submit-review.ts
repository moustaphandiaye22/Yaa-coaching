import type { NewReview, ReviewRepository } from '../domain/review-repository.js';

export type SubmitReviewInput = Omit<NewReview, 'consentAt' | 'consentVersion' | 'status'>;

export class SubmitReview {
  constructor(private readonly reviews: ReviewRepository) {}

  execute(input: SubmitReviewInput) {
    return this.reviews.createPendingReview({
      ...input,
      consentAt: new Date(),
      consentVersion: 'v1',
      status: 'PENDING',
    });
  }
}
