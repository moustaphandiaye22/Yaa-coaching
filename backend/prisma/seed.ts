import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const defaultFaqs = [
  {
    question: 'Faut-il être sportif pour commencer ?',
    answer: 'Non. Vous pouvez commencer même si vous n’avez pas l’habitude de pratiquer une activité. YAA COACHING vous accompagne pour vous stimuler, vous mettre en mouvement ou reprendre progressivement une activité physique et mentale. Chaque proposition tient compte de vos capacités, de vos besoins et de votre rythme.',
  },
  {
    question: 'Comment se déroule le début du parcours ?',
    answer: 'Le parcours commence par un entretien découverte. Il permet de faire le point, puis de définir ensemble les priorités, le format et les modalités de l’accompagnement.',
  },
  {
    question: 'Où et sous quel format peut-on être accompagné ?',
    answer: 'YAA COACHING et YAA AUTONOMIE interviennent à Vierzon et alentours. YAA PLAYER s’adresse aux jeunes footballeurs sans limite géographique : le suivi à distance et l’accompagnement en présentiel correspondent à des modalités distinctes, à préciser lors de l’entretien découverte.',
  },
  {
    question: 'Comment connaître les tarifs ?',
    answer: 'Le tarif et le contenu sont présentés lors de l’entretien découverte, en fonction de l’accompagnement envisagé.',
  },
];

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /example|placeholder|change-this|replace-me/i.test(email)) {
    throw new Error('Définissez une vraie adresse ADMIN_EMAIL dans backend/.env avant le seed.');
  }

  if (!password || password.length < 8 || /change-this|placeholder|replace-me/i.test(password)) {
    throw new Error('Définissez un ADMIN_PASSWORD d’au moins 8 caractères dans backend/.env avant le seed.');
  }

  return { email, password };
}

async function seedAdmin(email: string, password: string) {
  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', active: true },
    create: {
      email,
      passwordHash: await argon2.hash(password),
      role: 'ADMIN',
      active: true,
    },
  });
}

async function seedFaqs() {
  let createdCount = 0;

  for (const [position, faq] of defaultFaqs.entries()) {
    const existingFaq = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (existingFaq) continue;

    await prisma.faq.create({ data: { ...faq, position, published: true } });
    createdCount += 1;
  }

  return createdCount;
}

async function main() {
  const { email, password } = getAdminCredentials();

  await seedAdmin(email, password);
  const createdFaqs = await seedFaqs();

  console.info('Seed terminé : compte administrateur prêt et FAQ initialisées.');
  console.info(`FAQ ajoutées : ${createdFaqs}.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
