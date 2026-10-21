import { createReviewSchema } from '../../backend/src/modules/reviews/presentation/review-schemas.js';

const review = {
  pseudonym: 'Awa',
  service: 'YAA COACHING',
  rating: 5,
  message: 'Un accompagnement à l’écoute qui m’a aidée à avancer à mon rythme.',
  email: 'awa@example.fr',
  consent: true,
};

describe('public review validation', () => {
  it('accepts a complete consented review', () => {
    expect(createReviewSchema.safeParse(review).success).toBe(true);
  });

  it('requires consent and a message of at least twenty characters', () => {
    expect(createReviewSchema.safeParse({ ...review, consent: false }).success).toBe(false);
    expect(createReviewSchema.safeParse({ ...review, message: 'Très bien.' }).success).toBe(false);
  });
});
