import type { SubmissionPdfRenderer } from '../application/export-submission-pdf.js';

type PdfLine = { kind: 'section'; text: string } | { kind: 'field'; label: string; value: string };
type PdfPage = { commands: string[]; y: number };

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LEFT = 52;
const RIGHT = 543;
const BODY_WIDTH = 92;
const HIDDEN_ANSWERS = new Set([
  'contactEmail',
  'contactPhone',
  'city',
  'consent',
  'guardianConsent',
  'website',
]);

const answerLabels: Record<string, string> = {
  approach: 'Démarche',
  firstName: 'Prénom et nom de la personne accompagnée',
  representative: 'Proche ou responsable',
  age: 'Âge',
  situation: 'Situation',
  objective: 'Objectif recherché',
  goal: 'Objectif prioritaire',
  priorities: 'Priorités',
  playerPriorities: 'Priorités sportives',
  activity: 'Activité actuelle',
  activityDetails: 'Détails sur l’activité',
  activities: 'Activités souhaitées',
  helpStarting: 'Aide souhaitée pour commencer',
  difficulties: 'Difficultés rencontrées',
  coping: 'Façon de faire face aux difficultés',
  strengths: 'Forces et soutiens',
  needType: 'Type de besoin',
  expectations: 'Attentes de la personne accompagnée',
  familyExpectations: 'Attentes des proches',
  expectationsShared: 'Attentes partagées',
  expectationsSharedDetails: 'Précision sur les attentes partagées',
  success: 'Résultat attendu',
  deadline: 'Échéance envisagée',
  deadlineDetails: 'Détails de l’échéance',
  availability: 'Disponibilités',
  format: 'Format souhaité',
  constraints: 'Contraintes et adaptations',
  supportStyle: 'Accompagnement souhaité',
  otherInfo: 'Autres précisions',
  club: 'Club, catégorie et niveau',
  position: 'Poste principal',
  secondaryPosition: 'Poste secondaire',
  strongFoot: 'Pied fort',
  footballStart: 'Début du football',
  footballRhythm: 'Entraînements par semaine',
  weeklyMatches: 'Matchs par semaine',
  teamRole: 'Place dans l’équipe',
  mistakeReaction: 'Réaction après une erreur',
  pressure: 'Gestion de la pression',
  confidence: 'Confiance',
  effort: 'Efforts répétés',
  qualities: 'Qualités principales',
  progress: 'Axes de progression',
  seasonGoal: 'Objectifs sportifs',
  dailyActivities: 'Activités du quotidien',
  reassurance: 'Situations nécessitant un soutien',
  enjoy: 'Activités appréciées',
  dailyChange: 'Changement souhaité',
  surroundings: 'Entourage et soutien',
  weightLoss: 'Objectif de perte de poids',
  kilos: 'Perte de poids envisagée (kg)',
  whyGoal: 'Motivation liée à cet objectif',
  pastSupport: 'Accompagnements précédents',
  pastSupportDetails: 'Détails des accompagnements précédents',
};

const statusLabels: Record<string, string> = {
  NEW: 'Nouvelle',
  TO_CONTACT: 'À contacter',
  CONTACTED: 'Contactée',
  IN_PROGRESS: 'En cours',
  CLOSED: 'Clôturée',
  REJECTED: 'Refusée',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toDisplayValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(toDisplayValue).filter(Boolean).join(' · ');
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (isRecord(value)) return Object.values(value).map(toDisplayValue).filter(Boolean).join(' · ');
  return String(value).trim();
}

function readableQuestionKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (character) => character.toLocaleUpperCase('fr-FR'));
}

function formatDate(value: unknown): string {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.valueOf()) ? 'Non renseignée' : date.toLocaleString('fr-FR');
}

function wrapText(value: string, width = BODY_WIDTH): string[] {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return ['Non renseignée'];
  const words = normalized.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (word.length > width) {
      if (current) lines.push(current);
      for (let index = 0; index < word.length; index += width) {
        const part = word.slice(index, index + width);
        if (part.length === width) lines.push(part);
        else current = part;
      }
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width) {
      lines.push(current);
      current = word;
    } else current = candidate;
  }
  if (current) lines.push(current);
  return lines;
}

function winAnsiHex(value: string): string {
  const extraCharacters = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  const extraBytes = [
    0x80, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8e, 0x91, 0x92, 0x93,
    0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9e, 0x9f,
  ];
  return [...value]
    .map((character) => {
      const code = character.codePointAt(0) ?? 0x3f;
      const extraIndex = extraCharacters.indexOf(character);
      const byte = extraIndex >= 0 ? extraBytes[extraIndex] : code <= 0xff ? code : 0x3f;
      return byte.toString(16).padStart(2, '0');
    })
    .join('');
}

function pdfText(
  text: string,
  x: number,
  y: number,
  size: number,
  font = 'F1',
  color = '0.17 0.27 0.23',
) {
  return `BT /${font} ${size} Tf ${color} rg ${x} ${y} Td <${winAnsiHex(text)}> Tj ET`;
}

function pdfRect(x: number, y: number, width: number, height: number, color: string) {
  return `q ${color} rg ${x} ${y} ${width} ${height} re f Q`;
}

function buildDocumentLines(input: unknown): PdfLine[] {
  const data = isRecord(input) ? input : {};
  const lines: PdfLine[] = [
    { kind: 'section', text: 'Coordonnées de contact' },
    {
      kind: 'field',
      label: 'Nom de la personne à recontacter',
      value: toDisplayValue(data.contactName),
    },
    { kind: 'field', label: 'Adresse e-mail', value: toDisplayValue(data.contactEmail) },
    { kind: 'field', label: 'Téléphone', value: toDisplayValue(data.contactPhone) },
    { kind: 'field', label: 'Ville et pays', value: toDisplayValue(data.city) },
    { kind: 'section', text: 'Informations sur la demande' },
    {
      kind: 'field',
      label: 'Référence du dossier',
      value: toDisplayValue(data.id).slice(-8).toUpperCase(),
    },
    { kind: 'field', label: 'Accompagnement', value: toDisplayValue(data.service) },
    { kind: 'field', label: 'Date de réception', value: formatDate(data.createdAt) },
    {
      kind: 'field',
      label: 'Statut actuel',
      value: statusLabels[String(data.status)] ?? toDisplayValue(data.status),
    },
  ];

  const answers = isRecord(data.answers) ? data.answers : {};
  const questionnaireEntries = Object.entries(answers).filter(
    ([key, value]) => !HIDDEN_ANSWERS.has(key) && toDisplayValue(value),
  );
  if (questionnaireEntries.length) {
    lines.push({ kind: 'section', text: 'Réponses au questionnaire' });
    for (const [key, value] of questionnaireEntries) {
      lines.push({
        kind: 'field',
        label: answerLabels[key] ?? readableQuestionKey(key),
        value: toDisplayValue(value),
      });
    }
  }

  const history = Array.isArray(data.history) ? data.history.filter(isRecord) : [];
  if (history.length) {
    lines.push({ kind: 'section', text: 'Historique du dossier' });
    for (const entry of history) {
      const action = String(entry.action ?? 'Mise à jour')
        .replaceAll('_', ' ')
        .toLocaleLowerCase('fr-FR');
      const detail = toDisplayValue(entry.details);
      lines.push({
        kind: 'field',
        label: formatDate(entry.occurredAt),
        value: detail ? `${action} · ${detail}` : action,
      });
    }
  }

  const notes = toDisplayValue(data.internalNotes);
  if (notes) {
    lines.push({ kind: 'section', text: 'Notes internes' });
    lines.push({ kind: 'field', label: 'Suivi par l’équipe', value: notes });
  }
  lines.push({ kind: 'section', text: 'Confidentialité' });
  lines.push({
    kind: 'field',
    label: 'Consentement de contact',
    value: formatDate(data.consentAt),
  });
  if (data.guardianConsentAt) {
    lines.push({
      kind: 'field',
      label: 'Accord du parent ou responsable légal',
      value: formatDate(data.guardianConsentAt),
    });
  }
  return lines;
}

function createPages(lines: PdfLine[], input: unknown): PdfPage[] {
  const pages: PdfPage[] = [{ commands: [], y: 640 }];
  const data = isRecord(input) ? input : {};
  const answers = isRecord(data.answers) ? data.answers : {};
  const beneficiary = toDisplayValue(answers.firstName) || 'Nom non renseigné';
  const beneficiaryLines = wrapText(beneficiary, 48).slice(0, 2);
  if (wrapText(beneficiary, 48).length > 2)
    beneficiaryLines[1] = `${beneficiaryLines[1]?.slice(0, 43)}…`;
  const contactName = toDisplayValue(data.contactName) || 'Non renseigné';
  const contactLines = wrapText(contactName, 32).slice(0, 2);
  if (wrapText(contactName, 32).length > 2) contactLines[1] = `${contactLines[1]?.slice(0, 27)}…`;
  const rightColumn = LEFT + 254;
  const contactEmail = toDisplayValue(data.contactEmail);
  const contactPhone = toDisplayValue(data.contactPhone);
  const firstPage = pages[0]!;
  firstPage.commands.push(
    pdfRect(0, 660, PAGE_WIDTH, 182, '0.11 0.25 0.21'),
    pdfRect(LEFT, 786, 37, 37, '0.91 0.82 0.62'),
    pdfText('Y', LEFT + 12, 795, 22, 'F2', '0.11 0.25 0.21'),
    pdfText('YAA COACHING', LEFT + 50, 808, 11, 'F2', '1 1 0.96'),
    pdfText('LE CORPS · L’ESPRIT · VOUS', LEFT + 50, 792, 7, 'F1', '0.89 0.91 0.86'),
    pdfText('DEMANDE D’ACCOMPAGNEMENT', LEFT, 758, 14, 'F2', '1 1 0.96'),
    pdfText('PERSONNE ACCOMPAGNÉE', LEFT, 738, 7, 'F2', '0.89 0.91 0.86'),
    ...beneficiaryLines.map((line, index) =>
      pdfText(line, LEFT, 718 - index * 17, 13, 'F2', '1 1 0.96'),
    ),
    pdfText(
      toDisplayValue(data.service),
      LEFT,
      682 - Math.max(0, beneficiaryLines.length - 1) * 17,
      8,
      'F1',
      '0.89 0.91 0.86',
    ),
    pdfText('CONTACT À RAPPELER', rightColumn, 758, 7, 'F2', '0.89 0.91 0.86'),
    ...contactLines.map((line, index) =>
      pdfText(line, rightColumn, 738 - index * 16, 11, 'F2', '1 1 0.96'),
    ),
    ...(contactEmail
      ? [
          pdfText(
            contactEmail.length > 38 ? `${contactEmail.slice(0, 35)}…` : contactEmail,
            rightColumn,
            716 - Math.max(0, contactLines.length - 1) * 16,
            8,
            'F1',
            '0.89 0.91 0.86',
          ),
        ]
      : []),
    ...(contactPhone
      ? [
          pdfText(
            contactPhone,
            rightColumn,
            701 - Math.max(0, contactLines.length - 1) * 16,
            8,
            'F1',
            '0.89 0.91 0.86',
          ),
        ]
      : []),
  );
  firstPage.y = 638 - Math.max(0, beneficiaryLines.length - 1) * 17;

  const startPage = () => {
    const page: PdfPage = {
      commands: [
        pdfText('YAA COACHING · DOSSIER DE DEMANDE', LEFT, 814, 9, 'F2', '0.16 0.32 0.27'),
        `q 0.82 0.86 0.82 RG 1 w ${LEFT} 802 m ${RIGHT} 802 l S Q`,
      ],
      y: 780,
    };
    pages.push(page);
    return page;
  };

  const drawField = (
    page: PdfPage,
    field: Extract<PdfLine, { kind: 'field' }>,
    x: number,
    width: number,
    maxChars: number,
  ) => {
    const valueLines = wrapText(field.value, maxChars);
    const height = 30 + valueLines.length * 12;
    page.commands.push(pdfRect(x, page.y - height, width, height - 4, '0.98 0.98 0.95'));
    page.commands.push(pdfText(field.label, x + 9, page.y - 14, 7, 'F2', '0.38 0.47 0.42'));
    valueLines.forEach((text, index) => {
      page.commands.push(pdfText(text, x + 9, page.y - 29 - index * 12, 9, 'F1'));
    });
    return height;
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]!;
    let page = pages[pages.length - 1]!;
    if (line.kind === 'section') {
      const nextLine = lines[lineIndex + 1];
      const nextFieldHeight = nextLine?.kind === 'field' ? 42 : 0;
      if (page.y - 40 - nextFieldHeight < 60) page = startPage();
      page.y -= 21;
      page.commands.push(pdfRect(LEFT, page.y - 5, RIGHT - LEFT, 21, '0.91 0.94 0.89'));
      page.commands.push(
        pdfText(
          line.text.toLocaleUpperCase('fr-FR'),
          LEFT + 10,
          page.y + 2,
          9,
          'F2',
          '0.16 0.32 0.27',
        ),
      );
      page.y -= 19;
      continue;
    }

    const fullWidth = RIGHT - LEFT;
    const halfWidth = (fullWidth - 12) / 2;
    const shortLines = wrapText(line.value, 42);
    const next = lines[lineIndex + 1];
    const nextShortLines = next?.kind === 'field' ? wrapText(next.value, 42) : [];
    const canPair = shortLines.length <= 4 && next?.kind === 'field' && nextShortLines.length <= 4;

    if (shortLines.length > 4) {
      const longLines = wrapText(line.value, 88);
      const completeFieldHeight = 30 + longLines.length * 12;
      if (completeFieldHeight <= 680 && page.y - completeFieldHeight < 60) page = startPage();
      let cursor = 0;
      while (cursor < longLines.length) {
        page = pages[pages.length - 1]!;
        const capacity = Math.max(1, Math.floor((page.y - 60 - 30) / 12));
        const chunk = longLines.slice(cursor, cursor + capacity);
        const height = 30 + chunk.length * 12;
        page.commands.push(pdfRect(LEFT, page.y - height, fullWidth, height - 4, '0.98 0.98 0.95'));
        page.commands.push(
          pdfText(
            `${line.label}${cursor ? ' (suite)' : ''}`,
            LEFT + 9,
            page.y - 14,
            7,
            'F2',
            '0.38 0.47 0.42',
          ),
        );
        chunk.forEach((text, index) => {
          page.commands.push(pdfText(text, LEFT + 9, page.y - 29 - index * 12, 9, 'F1'));
        });
        page.y -= height + 8;
        cursor += chunk.length;
        if (cursor < longLines.length) startPage();
      }
      continue;
    }

    const firstHeight = 30 + shortLines.length * 12;
    const secondHeight = canPair ? 30 + nextShortLines.length * 12 : 0;
    const rowHeight = Math.max(firstHeight, secondHeight);
    if (page.y - rowHeight - 8 < 60) page = startPage();
    const renderedHeight = canPair
      ? drawField(page, line, LEFT, halfWidth, 42)
      : drawField(page, line, LEFT, fullWidth, 88);
    if (canPair) {
      drawField(page, next, LEFT + halfWidth + 12, halfWidth, 42);
      lineIndex += 1;
    }
    page.y -= Math.max(renderedHeight, rowHeight) + 8;
  }
  return pages;
}

function buildPdf(pages: PdfPage[]): Uint8Array {
  const objects: string[] = [''];
  const addObject = (value: string) => {
    objects.push(value);
    return objects.length - 1;
  };
  const catalogId = addObject('');
  const pagesId = addObject('');
  const regularFontId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  );
  const boldFontId = addObject(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  );
  const pageIds: number[] = [];

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const commands = [
      ...page.commands,
      `q 0.82 0.86 0.82 RG 1 w ${LEFT} 46 m ${RIGHT} 46 l S Q`,
      pdfText('YAA COACHING · DOCUMENT CONFIDENTIEL', LEFT, 31, 7, 'F2', '0.38 0.47 0.42'),
      pdfText(`PAGE ${pageNumber} / ${pages.length}`, RIGHT - 70, 31, 7, 'F1', '0.38 0.47 0.42'),
    ].join('\n');
    const stream = `${commands}\n`;
    const length = Buffer.byteLength(stream, 'ascii');
    const contentId = addObject(`<< /Length ${length} >>\nstream\n${stream}endstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  });

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  let document = '%PDF-1.4\n%YAA\n';
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(document, 'ascii');
    document += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(document, 'ascii');
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    document += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  document += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(document);
}

export class SubmissionPdfDocumentRenderer implements SubmissionPdfRenderer {
  render(submission: unknown): Uint8Array {
    return buildPdf(createPages(buildDocumentLines(submission), submission));
  }
}
