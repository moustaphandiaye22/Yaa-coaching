import type {
  NewReview,
  ReviewRepository,
} from '../../backend/src/modules/reviews/domain/review-repository.js';
import { SubmitReview } from '../../backend/src/modules/reviews/application/submit-review.js';

describe('submit review', () => {
  it('persists only review model fields and records consent metadata', async () => {
    const createPendingReview = jest.fn(async (review: NewReview) => {
      void review;
      return { id: 'review-1', status: 'PENDING' as const };
    });
    const repository = { createPendingReview } as unknown as ReviewRepository;
    const submitReview = new SubmitReview(repository);

    await submitReview.execute({
      pseudonym: 'Awa',
      service: 'YAA COACHING',
      rating: 5,
      message: 'Un accompagnement qui m’a aidée à avancer à mon rythme.',
      email: 'awa@example.fr',
      consent: true,
    });

    expect(createPendingReview).toHaveBeenCalledTimes(1);
    const persistedReview = createPendingReview.mock.calls[0][0];
    expect(persistedReview).toEqual(
      expect.objectContaining({
        pseudonym: 'Awa',
        service: 'YAA COACHING',
        rating: 5,
        email: 'awa@example.fr',
        consentVersion: 'v1',
        status: 'PENDING',
      }),
    );
    expect(persistedReview).not.toHaveProperty('consent');
    expect(persistedReview.consentAt).toBeInstanceOf(Date);
  });
});
