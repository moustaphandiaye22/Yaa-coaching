import type { NewReview, ReviewRepository } from '../domain/review-repository.js';

export type SubmitReviewInput = Omit<NewReview, 'consentAt' | 'consentVersion' | 'status'> & {
  consent: boolean;
};

export class SubmitReview {
  constructor(private readonly reviews: ReviewRepository) {}

  execute(input: SubmitReviewInput) {
    return this.reviews.createPendingReview({
      pseudonym: input.pseudonym,
      service: input.service,
      rating: input.rating,
      message: input.message,
      email: input.email,
      consentAt: new Date(),
      consentVersion: 'v1',
      status: 'PENDING',
    });
  }
}
