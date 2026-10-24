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
  let migratedSubmissions = 0;
  for (const item of submissions) {
    const name = decryptSensitive(item.contactName);
    const email = decryptSensitive(item.contactEmail);
    const answersText =
      typeof item.answers === 'string' ? item.answers : JSON.stringify(item.answers);
    JSON.parse(decryptSensitive(answersText));
    const protectedFields = {
      contactName: encryptSensitive(item.contactName),
      contactEmail: encryptSensitive(item.contactEmail),
      city: encryptSensitive(item.city),
      contactPhone: item.contactPhone ? encryptSensitive(item.contactPhone) : null,
      internalNotes: item.internalNotes ? encryptSensitive(item.internalNotes) : '',
      answers: encryptSensitive(answersText),
      contactNameIndex: blindIndex(name),
      contactEmailIndex: blindIndex(email),
    };
    if (
      protectedFields.contactName === item.contactName &&
      protectedFields.contactEmail === item.contactEmail &&
      protectedFields.city === item.city &&
      protectedFields.contactPhone === item.contactPhone &&
      protectedFields.internalNotes === item.internalNotes &&
      protectedFields.answers === answersText &&
      protectedFields.contactNameIndex === item.contactNameIndex &&
      protectedFields.contactEmailIndex === item.contactEmailIndex
    ) {
      continue;
    }
    await prisma.submission.update({
      where: { id: item.id },
      data: protectedFields,
    });
    migratedSubmissions += 1;
  }
  const reviews = await prisma.review.findMany();
  let migratedReviews = 0;
  for (const item of reviews) {
    const email = decryptSensitive(item.email);
    const protectedEmail = encryptSensitive(item.email);
    const emailIndex = blindIndex(email);
    if (protectedEmail === item.email && emailIndex === item.emailIndex) continue;
    await prisma.review.update({
      where: { id: item.id },
      data: { email: protectedEmail, emailIndex },
    });
    migratedReviews += 1;
  }
  console.log(
    `Chiffrement vérifié : ${migratedSubmissions} demande(s) mise(s) à jour sur ${submissions.length}, ${migratedReviews} avis sur ${reviews.length}.`,
  );
} finally {
  await prisma.$disconnect();
}
