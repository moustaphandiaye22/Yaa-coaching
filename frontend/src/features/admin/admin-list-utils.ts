export function normalizeAdminSearch(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr-FR');
}

export function matchesAdminSearch(query: string, ...values: unknown[]): boolean {
  const normalizedQuery = normalizeAdminSearch(query.trim());
  if (!normalizedQuery) return true;
  return values.some((value) => normalizeAdminSearch(value).includes(normalizedQuery));
}
