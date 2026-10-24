import {
  blindIndex,
  decryptSensitive,
  encryptSensitive,
} from '../../backend/src/shared/security/encryption';

describe('protection des données personnelles', () => {
  const previousKey = process.env.DATA_ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.DATA_ENCRYPTION_KEY = 'a'.repeat(64);
  });

  afterAll(() => {
    if (previousKey === undefined) delete process.env.DATA_ENCRYPTION_KEY;
    else process.env.DATA_ENCRYPTION_KEY = previousKey;
  });

  it('chiffre une valeur et conserve le même chiffrement lors des relances de migration', () => {
    const encrypted = encryptSensitive('contact@example.fr');

    expect(encrypted).not.toContain('contact@example.fr');
    expect(encryptSensitive(encrypted)).toBe(encrypted);
    expect(decryptSensitive(encrypted)).toBe('contact@example.fr');
  });

  it('permet encore de lire les valeurs historiques en clair', () => {
    expect(decryptSensitive('ancienne valeur')).toBe('ancienne valeur');
  });

  it('normalise l’index aveugle pour une recherche exacte', () => {
    expect(blindIndex('  CONTACT@Example.fr ')).toBe(blindIndex('contact@example.FR'));
  });
});
