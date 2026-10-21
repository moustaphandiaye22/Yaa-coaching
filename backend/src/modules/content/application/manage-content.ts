import type { ContentRepository } from '../domain/content-repository.js';

export class ManageContent {
  constructor(private readonly contents: ContentRepository) {}

  listPublic() {
    return this.contents.listPublic();
  }
  findPublic(key: string) {
    return this.contents.findPublic(key);
  }
  listAdmin() {
    return this.contents.listAdmin();
  }
  preview(key: string) {
    return this.contents.preview(key);
  }
  listRevisions(key: string) {
    return this.contents.listRevisions(key);
  }
  save(key: string, content: Record<string, unknown>, publish: boolean, actorId: string) {
    return this.contents.save(key, content, publish, actorId);
  }
  unpublish(key: string, actorId: string) {
    return this.contents.unpublish(key, actorId);
  }
}
