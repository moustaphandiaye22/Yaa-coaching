export type MediaKind = 'PHOTO' | 'VIDEO';
export type NewMedia = { kind: MediaKind; service: string; url: string; alt: string; caption: string; position?: number; published?: boolean };
export type MediaChanges = Partial<NewMedia>;

export interface MediaRepository {
  list(publishedOnly: boolean): Promise<unknown[]>;
  findById(id: string): Promise<unknown | null>;
  create(data: NewMedia, actorId: string): Promise<unknown>;
  update(id: string, data: MediaChanges, actorId: string): Promise<unknown>;
  delete(id: string, actorId: string): Promise<void>;
}
