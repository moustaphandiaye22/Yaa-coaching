export const submissionStatuses = [
  'NEW', 'TO_CONTACT', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED',
] as const;

export type SubmissionStatus = (typeof submissionStatuses)[number];
