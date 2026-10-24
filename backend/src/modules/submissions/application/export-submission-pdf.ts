import type { SubmissionRepository } from '../domain/submission-repository.js';

export interface SubmissionPdfRenderer {
  render(submission: unknown): Uint8Array;
}

export class ExportSubmissionPdf {
  constructor(
    private readonly submissions: SubmissionRepository,
    private readonly renderer: SubmissionPdfRenderer,
  ) {}

  async execute(id: string): Promise<Uint8Array | null> {
    const submission = await this.submissions.findById(id);
    return submission ? this.renderer.render(submission) : null;
  }
}
