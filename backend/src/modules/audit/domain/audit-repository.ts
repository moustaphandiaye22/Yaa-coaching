export interface AuditRepository {
  listRecent(
    limit: number,
    before?: string,
  ): Promise<{ items: unknown[]; nextCursor: string | null }>;
}
