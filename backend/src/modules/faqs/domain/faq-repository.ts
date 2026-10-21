export type NewFaq = { question: string; answer: string; position?: number; published?: boolean };
export type FaqChanges = Partial<NewFaq>;

export interface FaqRepository {
  listPublic(): Promise<unknown[]>;
  listAdmin(): Promise<unknown[]>;
  create(data: NewFaq, actorId: string): Promise<unknown>;
  update(id: string, data: FaqChanges, actorId: string): Promise<unknown>;
  delete(id: string, actorId: string): Promise<void>;
}
