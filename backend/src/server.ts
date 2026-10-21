import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './shared/database/prisma.js';
import { assertProductionPrivacyConfiguration, applyRetentionPolicy } from './modules/submissions/application/retention-policy.js';
import { ResendNotificationDispatcher } from './modules/notifications/infrastructure/resend-notification-dispatcher.js';
import { blindIndex } from './shared/security/encryption.js';

if (!process.env.DATA_ENCRYPTION_KEY) throw new Error('DATA_ENCRYPTION_KEY est obligatoire pour démarrer le backend.');
blindIndex('validation');
assertProductionPrivacyConfiguration();

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => console.log(`YAA API disponible sur http://localhost:${port}`));
const dispatcher = new ResendNotificationDispatcher(prisma);
const dispatchTimer = setInterval(() => { void dispatcher.dispatchPending().catch(() => console.error('Échec du traitement des notifications.')); }, 60_000);
const retentionTimer = setInterval(() => { void applyRetentionPolicy(prisma).catch(() => console.error('Échec de la tâche de conservation des données.')); }, 24 * 60 * 60 * 1000);
void dispatcher.dispatchPending().catch(() => console.error('Échec du traitement initial des notifications.'));
void applyRetentionPolicy(prisma).catch(() => console.error('Échec de la tâche initiale de conservation des données.'));

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    clearInterval(dispatchTimer);
    clearInterval(retentionTimer);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
