import type { MediaRepository, MediaChanges, NewMedia } from '../domain/media-repository.js';
type MediaStorage = {
  save(
    data: Buffer,
    mime: string,
    kind: 'PHOTO' | 'VIDEO',
  ): Promise<{ url: string; mime: string; size: number }>;
  remove(url: string): Promise<void>;
  root: string;
};

export class ManageMedia {
  constructor(
    private readonly media: MediaRepository,
    private readonly storage: MediaStorage,
  ) {}

  listAdmin() {
    return this.media.list(false);
  }
  create(data: NewMedia, actorId: string) {
    return this.media.create(data, actorId);
  }
  update(id: string, changes: MediaChanges, actorId: string) {
    return this.media.update(id, changes, actorId);
  }
  async delete(id: string, actorId: string) {
    const item = (await this.media.findById(id)) as { url?: string } | null;
    await this.media.delete(id, actorId);
    if (item?.url) await this.storage.remove(item.url);
  }
  upload(data: Buffer, mime: string, kind: 'PHOTO' | 'VIDEO') {
    return this.storage.save(data, mime, kind);
  }
  get storageRoot() {
    return this.storage.root;
  }
}

export class ReadPublicMedia {
  constructor(private readonly media: MediaRepository) {}
  execute() {
    return this.media.list(true);
  }
}
