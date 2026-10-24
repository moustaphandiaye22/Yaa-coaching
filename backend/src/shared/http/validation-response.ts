import type { ZodError } from 'zod';

type IssueDetails = {
  code: string;
  format?: string;
  validation?: string;
  minimum?: number;
  maximum?: number;
  origin?: string;
  type?: string;
};

function issueMessage(issue: ZodError['issues'][number]): string {
  const details = issue as unknown as IssueDetails;
  if (details.code === 'custom') return issue.message;
  if (issue.path.some((part) => String(part).toLowerCase().includes('consent'))) {
    return 'Cochez cette case pour donner votre accord.';
  }
  if (details.code === 'invalid_type') return 'Ce champ est obligatoire.';
  if (details.code === 'invalid_string' && details.validation === 'email') {
    return 'Saisissez une adresse e-mail valide.';
  }
  if (details.code === 'invalid_enum_value') {
    return 'Choisissez une option proposée.';
  }
  if (details.code === 'too_small' && typeof details.minimum === 'number') {
    if (details.origin === 'array' || details.type === 'array') {
      return `Sélectionnez au moins ${details.minimum} option${details.minimum > 1 ? 's' : ''}.`;
    }
    return details.minimum <= 1
      ? 'Renseignez ce champ.'
      : `Saisissez au moins ${details.minimum} caractères.`;
  }
  if (details.code === 'too_big' && typeof details.maximum === 'number') {
    if (details.origin === 'array' || details.type === 'array') {
      return `Sélectionnez au maximum ${details.maximum} options.`;
    }
    return `Saisissez au maximum ${details.maximum} caractères.`;
  }
  return 'Vérifiez cette information.';
}

export function validationResponse(
  error: ZodError,
  labels: Record<string, string>,
  prefix: string,
) {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.map(String).join('.') || 'formulaire';
    const label = labels[path] ?? labels[issue.path.at(-1)?.toString() ?? ''] ?? 'Une information';
    const message = issueMessage(issue);
    const fieldMessage = `${label} : ${message}`;
    fields[path] ??= [];
    if (!fields[path].includes(fieldMessage)) fields[path].push(fieldMessage);
  }

  const details = Object.values(fields).flat().join(' ');
  return {
    error: `${prefix}${details ? ` ${details}` : ''} Corrigez les champs indiqués puis réessayez.`,
    fields,
  };
}
