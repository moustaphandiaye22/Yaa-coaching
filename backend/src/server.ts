import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './shared/database/prisma.js';
import {
  assertProductionPrivacyConfiguration,
  applyRetentionPolicy,
} from './modules/submissions/application/retention-policy.js';
import { blindIndex } from './shared/security/encryption.js';
import { PrismaRetentionRepository } from './modules/submissions/infrastructure/prisma-retention-repository.js';

if (!process.env.DATA_ENCRYPTION_KEY)
  throw new Error('DATA_ENCRYPTION_KEY est obligatoire pour démarrer le backend.');
blindIndex('validation');
assertProductionPrivacyConfiguration();

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () =>
  console.log(`YAA API disponible sur http://localhost:${port}`),
);
const retention = new PrismaRetentionRepository(prisma);
const retentionTimer = setInterval(
  () => {
    void applyRetentionPolicy(retention).catch(() =>
      console.error('Échec de la tâche de conservation des données.'),
    );
  },
  24 * 60 * 60 * 1000,
);
void applyRetentionPolicy(retention).catch(() =>
  console.error('Échec de la tâche initiale de conservation des données.'),
);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    clearInterval(retentionTimer);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
