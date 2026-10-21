import { createHash } from 'node:crypto';
import type { NewSubmission, SubmissionRepository } from '../domain/submission-repository.js';

export type SubmitSubmissionInput = Omit<NewSubmission, 'consentAt' | 'consentVersion' | 'guardianConsentAt' | 'guardianConsentVersion' | 'questionnaireVersion' | 'idempotencyKey' | 'status'> & {
  guardianConsent: boolean;
};

export class SubmitSubmission {
  constructor(private readonly submissions: SubmissionRepository) {}

  execute(input: SubmitSubmissionInput) {
    const { guardianConsent, ...submission } = input;
    const timeBucket = Math.floor(Date.now() / (2 * 60 * 1000));
    const idempotencyKey = createHash('sha256')
      .update(JSON.stringify([submission.contactEmail.toLowerCase(), submission.service, submission.answers, timeBucket]))
      .digest('hex');
    return this.submissions.createSubmission({
      ...submission,
      consentAt: new Date(),
      consentVersion: 'v1',
      guardianConsentAt: guardianConsent ? new Date() : null,
      guardianConsentVersion: guardianConsent ? 'v1' : null,
      questionnaireVersion: 'v1',
      idempotencyKey,
      status: 'NEW',
    });
  }
}
