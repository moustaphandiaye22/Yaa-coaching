import type { FaqChanges, FaqRepository, NewFaq } from '../domain/faq-repository.js';

export class ManageFaqs {
  constructor(private readonly faqs: FaqRepository) {}

  listPublic() {
    return this.faqs.listPublic();
  }
  listAdmin() {
    return this.faqs.listAdmin();
  }
  create(data: NewFaq, actorId: string) {
    return this.faqs.create(data, actorId);
  }
  update(id: string, changes: FaqChanges, actorId: string) {
    return this.faqs.update(id, changes, actorId);
  }
  delete(id: string, actorId: string) {
    return this.faqs.delete(id, actorId);
  }
}
