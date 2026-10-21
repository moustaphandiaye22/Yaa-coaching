import type { SubmissionRepository } from '../domain/submission-repository.js';
import type { SubmissionStatus } from '../domain/submission-status.js';

export class ManageSubmissions {
  constructor(private readonly submissions: SubmissionRepository) {}

  list(status: SubmissionStatus | undefined, query: string, page: number, size: number) {
    return this.submissions.listAdmin(status, query, page, size);
  }
  find(id: string) {
    return this.submissions.findById(id);
  }
  update(
    id: string,
    changes: { status?: SubmissionStatus; internalNotes?: string },
    actorId: string,
  ) {
    return this.submissions.updateAdmin(id, { ...changes, actorId });
  }
  delete(id: string, actorId: string) {
    return this.submissions.deleteAdmin(id, actorId);
  }
}
