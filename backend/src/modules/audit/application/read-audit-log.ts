import type { AuditRepository } from '../domain/audit-repository.js';

export class ReadAuditLog {
  constructor(private readonly audit: AuditRepository) {}

  execute(cursor?: string) {
    return this.audit.listRecent(100, cursor);
  }
}
