import type { SubmissionStatus } from './submission-status.js';

export type NewSubmission = {
  service: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  answers: Record<string, unknown>;
  consentAt: Date;
  consentVersion: string;
  guardianConsentAt: Date | null;
  guardianConsentVersion: string | null;
  questionnaireVersion: string;
  idempotencyKey: string;
  status: SubmissionStatus;
};

export interface SubmissionRepository {
  createSubmission(submission: NewSubmission): Promise<{ id: string; createdAt: Date }>;
  listAdmin(status: SubmissionStatus | undefined, query: string, page: number, size: number): Promise<[unknown[], number]>;
  findById(id: string): Promise<unknown | null>;
  updateAdmin(id: string, data: { status?: SubmissionStatus; internalNotes?: string; actorId?: string }): Promise<unknown>;
  deleteAdmin(id: string, actorId: string): Promise<void>;
}
