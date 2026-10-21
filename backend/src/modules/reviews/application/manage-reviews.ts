import type { ReviewRepository } from '../domain/review-repository.js';
import type { ReviewStatus } from '../domain/review-status.js';

export class ManageReviews {
  constructor(private readonly reviews: ReviewRepository) {}

  listPublic() {
    return this.reviews.listPublic();
  }
  listAdmin(status?: ReviewStatus) {
    return this.reviews.listAdmin(status);
  }
  updateStatus(id: string, status: ReviewStatus, actorId: string) {
    return this.reviews.updateStatus(id, status, actorId);
  }
  delete(id: string, actorId: string) {
    return this.reviews.delete(id, actorId);
  }
}
