export interface RetentionRepository {
  applyRetention(input: {
    submissionCutoff: Date;
    reviewCutoff: Date;
    notificationCutoff: Date;
  }): Promise<{ submissions: number; reviewEmails: number }>;
}

function configuredDays(name: string, defaultDays: number): number {
  const raw = process.env[name];
  const value = raw === undefined || raw === '' ? defaultDays : Number(raw);
  if (!Number.isInteger(value) || value < 30 || value > 3650)
    throw new Error(`${name} doit être un nombre de jours entre 30 et 3650.`);
  return value;
}

export function assertProductionPrivacyConfiguration(): void {
  if (process.env.NODE_ENV !== 'production') return;
  if (!process.env.DATA_ENCRYPTION_KEY)
    throw new Error('DATA_ENCRYPTION_KEY est obligatoire en production.');
  configuredDays('SUBMISSION_RETENTION_DAYS', 365);
  configuredDays('REVIEW_EMAIL_RETENTION_DAYS', 90);
}

export async function applyRetentionPolicy(
  repository: RetentionRepository,
): Promise<{ submissions: number; reviewEmails: number }> {
  const submissionDays = configuredDays('SUBMISSION_RETENTION_DAYS', 365);
  const reviewEmailDays = configuredDays('REVIEW_EMAIL_RETENTION_DAYS', 90);
  const submissionCutoff = new Date(Date.now() - submissionDays * 86_400_000);
  const reviewCutoff = new Date(Date.now() - reviewEmailDays * 86_400_000);
  return repository.applyRetention({
    submissionCutoff,
    reviewCutoff,
    notificationCutoff: new Date(Date.now() - 90 * 86_400_000),
  });
}
