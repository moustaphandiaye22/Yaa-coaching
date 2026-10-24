import { z } from 'zod';
import { validationResponse } from '../../backend/src/shared/http/validation-response';

describe('messages de validation HTTP', () => {
  it('renvoie un résumé en français et des erreurs associées aux champs', () => {
    const schema = z.object({
      email: z.string().email(),
      consent: z.literal(true),
    });
    const parsed = schema.safeParse({ email: 'adresse-invalide', consent: false });

    if (parsed.success) throw new Error('Le jeu de données de test devrait être refusé.');
    const response = validationResponse(
      parsed.error,
      { email: 'L’adresse e-mail', consent: 'Votre accord' },
      'Votre demande n’a pas été envoyée.',
    );

    expect(response.error).toContain('Votre demande n’a pas été envoyée.');
    expect(response.fields.email[0]).toContain('L’adresse e-mail');
    expect(response.fields.consent[0]).toContain('Votre accord');
    expect(response.error).toContain('Corrigez les champs indiqués puis réessayez.');
  });
});
