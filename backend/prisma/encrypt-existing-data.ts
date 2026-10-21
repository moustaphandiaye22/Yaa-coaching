import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  blindIndex,
  decryptSensitive,
  encryptSensitive,
} from '../src/shared/security/encryption.js';

const prisma = new PrismaClient();
blindIndex('validation');

try {
  const submissions = await prisma.submission.findMany();
  for (const item of submissions) {
    const name = decryptSensitive(item.contactName);
    const email = decryptSensitive(item.contactEmail);
    const city = decryptSensitive(item.city);
    const phone = item.contactPhone ? decryptSensitive(item.contactPhone) : null;
    const notes = decryptSensitive(item.internalNotes);
    const answers =
      typeof item.answers === 'string' ? JSON.parse(decryptSensitive(item.answers)) : item.answers;
    await prisma.submission.update({
      where: { id: item.id },
      data: {
        contactName: encryptSensitive(name),
        contactEmail: encryptSensitive(email),
        city: encryptSensitive(city),
        contactPhone: phone ? encryptSensitive(phone) : null,
        internalNotes: notes ? encryptSensitive(notes) : '',
        answers: encryptSensitive(JSON.stringify(answers)),
        contactNameIndex: blindIndex(name),
        contactEmailIndex: blindIndex(email),
      },
    });
  }
  const reviews = await prisma.review.findMany();
  for (const item of reviews) {
    const email = decryptSensitive(item.email);
    await prisma.review.update({
      where: { id: item.id },
      data: { email: encryptSensitive(email), emailIndex: blindIndex(email) },
    });
  }
  console.log(`Chiffrement terminé : ${submissions.length} demande(s), ${reviews.length} avis.`);
} finally {
  await prisma.$disconnect();
}
