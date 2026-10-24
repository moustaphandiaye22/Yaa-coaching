import { SubmissionPdfDocumentRenderer } from '../../backend/src/modules/submissions/infrastructure/submission-pdf-renderer.js';

describe('submission PDF renderer', () => {
  const renderer = new SubmissionPdfDocumentRenderer();
  const encodedText = (value: string) => Buffer.from(value, 'latin1').toString('hex');

  it('creates a downloadable PDF with the dossier details and page index', () => {
    const document = renderer.render({
      id: 'cm1234567890abcdef',
      contactName: 'Awa Diop',
      contactEmail: 'awa@example.fr',
      contactPhone: '+33 6 00 00 00 00',
      city: 'Vierzon',
      service: 'YAA COACHING',
      status: 'NEW',
      createdAt: '2026-10-24T12:00:00.000Z',
      consentAt: '2026-10-24T12:00:00.000Z',
      answers: {
        age: '35',
        priorities: ['Confiance', 'Mobilité'],
        contactEmail: 'duplicate@example.fr',
      },
    });
    const pdf = Buffer.from(document).toString('ascii');

    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain('/Type /Page');
    expect(pdf).toContain(`<${encodedText('PAGE 1 / 1')}> Tj`);
    expect(pdf).toContain('/Count 1');
    expect(pdf).not.toContain(encodedText('duplicate@example.fr'));
    const startXref = Number(pdf.match(/startxref\n(\d+)/)?.[1]);
    expect(pdf.slice(startXref, startXref + 4)).toBe('xref');
  });

  it('splits long answers across printable pages', () => {
    const document = renderer.render({
      contactName: 'Personne accompagnée',
      answers: {
        otherInfo: Array.from({ length: 300 }, (_, index) => `Précision ${index}`).join(' '),
      },
    });
    const pdf = Buffer.from(document).toString('ascii');

    expect(pdf).toContain('/Count 2');
    expect(pdf).toContain(`<${encodedText('PAGE 2 / 2')}> Tj`);
  });
});
