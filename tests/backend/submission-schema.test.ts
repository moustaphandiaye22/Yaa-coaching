import { createSubmissionSchema } from '../../backend/src/modules/submissions/presentation/submission-schemas.js';

const adultSubmission = {
  service: 'YAA COACHING',
  city: 'Vierzon',
  contactName: 'Awa Diop',
  contactEmail: 'awa@example.fr',
  answers: {
    approach: 'Pour moi-même',
    firstName: 'Awa',
    age: '35',
    city: 'Vierzon',
    situation: 'Commencer une activité',
    difficulties: 'Je souhaite reprendre doucement une activité.',
    expectations: 'Trouver un accompagnement adapté.',
    goal: 'Reprendre une activité régulière.',
    contactEmail: 'awa@example.fr',
  },
  consent: true,
};

describe('public submission validation', () => {
  it('accepts a complete adult request', () => {
    expect(createSubmissionSchema.safeParse(adultSubmission).success).toBe(true);
  });

  it('requires parent consent for a minor', () => {
    const minorSubmission = {
      ...adultSubmission,
      contactName: 'Mamadou Diop',
      answers: {
        ...adultSubmission.answers,
        approach: 'Pour mon enfant',
        firstName: 'Ibrahima',
        age: '16',
      },
    };

    expect(createSubmissionSchema.safeParse(minorSubmission).success).toBe(false);
    expect(
      createSubmissionSchema.safeParse({ ...minorSubmission, guardianConsent: true }).success,
    ).toBe(true);
  });

  it('rejects more than three selected priorities', () => {
    const submission = {
      ...adultSubmission,
      answers: { ...adultSubmission.answers, priorities: ['one', 'two', 'three', 'four'] },
    };

    expect(createSubmissionSchema.safeParse(submission).success).toBe(false);
  });

  it('validates numeric answers and requires details for a yes answer', () => {
    const invalidAge = {
      ...adultSubmission,
      answers: { ...adultSubmission.answers, age: '121' },
    };
    const missingDetails = {
      ...adultSubmission,
      answers: { ...adultSubmission.answers, pastSupport: 'Oui' },
    };

    expect(createSubmissionSchema.safeParse(invalidAge).success).toBe(false);
    expect(createSubmissionSchema.safeParse(missingDetails).success).toBe(false);
  });

  it('validates conditional numeric and yes/no answers used by the five-step form', () => {
    const invalidWeeklyMatches = {
      ...adultSubmission,
      answers: { ...adultSubmission.answers, weeklyMatches: '15' },
    };
    const missingKilos = {
      ...adultSubmission,
      answers: { ...adultSubmission.answers, weightLoss: 'Oui' },
    };
    const missingSharedExpectations = {
      ...adultSubmission,
      answers: { ...adultSubmission.answers, expectationsShared: 'Oui' },
    };

    expect(createSubmissionSchema.safeParse(invalidWeeklyMatches).success).toBe(false);
    expect(createSubmissionSchema.safeParse(missingKilos).success).toBe(false);
    expect(createSubmissionSchema.safeParse(missingSharedExpectations).success).toBe(false);
  });
});
