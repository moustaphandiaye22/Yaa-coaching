export const reviewStatuses = ['PENDING', 'PUBLISHED', 'REJECTED', 'HIDDEN'] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];
