export type Submission = {
  id: string;
  service: string;
  city: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  status: string;
  createdAt: string;
  answers?: Record<string, unknown>;
  internalNotes?: string;
};

export type ReviewAdmin = {
  id: string;
  pseudonym: string;
  service: string;
  rating: number;
  message: string;
  email: string;
  status: string;
  createdAt: string;
};

export type AdminFaq = { id: string; question: string; answer: string; published: boolean };
