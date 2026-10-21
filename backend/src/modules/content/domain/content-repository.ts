export interface ContentRepository {
  listPublic(): Promise<unknown[]>;
  listAdmin(): Promise<unknown[]>;
  preview(key: string): Promise<unknown | null>;
  listRevisions(key: string): Promise<unknown[]>;
  save(
    key: string,
    content: Record<string, unknown>,
    publish: boolean,
    actorId: string,
  ): Promise<unknown>;
  unpublish(key: string, actorId: string): Promise<unknown>;
}
