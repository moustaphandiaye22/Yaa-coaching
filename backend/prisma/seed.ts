import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { services } from './default-services.js';
import { getQuestionnaire } from './default-questionnaires.js';
import { publicContentDefaults } from './default-public-content.js';
import { defaultMedia } from './default-media.js';

const prisma = new PrismaClient();

const defaultFaqs = [
  {
    question: 'Faut-il être sportif pour commencer ?',
    answer:
      'Non. Vous pouvez commencer même si vous n’avez pas l’habitude de pratiquer une activité. YAA COACHING vous accompagne pour vous stimuler, vous mettre en mouvement ou reprendre progressivement une activité physique et mentale. Chaque proposition tient compte de vos capacités, de vos besoins et de votre rythme.',
  },
  {
    question: 'Comment se déroule le début du parcours ?',
    answer:
      'Le parcours commence par un entretien découverte. Il permet de faire le point, puis de définir ensemble les priorités, le format et les modalités de l’accompagnement.',
  },
  {
    question: 'Où et sous quel format peut-on être accompagné ?',
    answer:
      'YAA COACHING et YAA AUTONOMIE interviennent à Vierzon et alentours. YAA PLAYER s’adresse aux jeunes footballeurs sans limite géographique : le suivi à distance et l’accompagnement en présentiel correspondent à des modalités distinctes, à préciser lors de l’entretien découverte.',
  },
  {
    question: 'Comment connaître les tarifs ?',
    answer:
      'Le tarif et le contenu sont présentés lors de l’entretien découverte, en fonction de l’accompagnement envisagé.',
  },
];

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    /example|placeholder|change-this|replace-me/i.test(email)
  ) {
    throw new Error('Définissez une vraie variable d’environnement ADMIN_EMAIL avant le seed.');
  }

  if (!password || password.length < 8 || /change-this|placeholder|replace-me/i.test(password)) {
    throw new Error(
      'Définissez une variable d’environnement ADMIN_PASSWORD d’au moins 8 caractères avant le seed.',
    );
  }

  return { email, password };
}

async function seedAdmin(email: string, password: string) {
  await prisma.user.upsert({
    where: { email },
    update: {},
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

async function seedMedia() {
  let createdCount = 0;
  for (const media of defaultMedia) {
    const existing = await prisma.media.findFirst({ where: { url: media.url } });
    if (existing) continue;
    await prisma.media.create({ data: media });
    createdCount += 1;
  }
  return createdCount;
}

function mergeMissingValues(existing: unknown, defaults: unknown): unknown {
  if (existing === undefined) return defaults;
  if (Array.isArray(existing) && Array.isArray(defaults)) {
    return defaults.map((value, index) => mergeMissingValues(existing[index], value));
  }
  if (
    existing &&
    defaults &&
    typeof existing === 'object' &&
    typeof defaults === 'object' &&
    !Array.isArray(existing) &&
    !Array.isArray(defaults)
  ) {
    const current = existing as Record<string, unknown>;
    const initial = defaults as Record<string, unknown>;
    return {
      ...current,
      ...Object.fromEntries(
        Object.entries(initial).map(([key, value]) => [
          key,
          mergeMissingValues(current[key], value),
        ]),
      ),
    };
  }
  return existing;
}

async function seedPublishedContent() {
  const defaults = [
    {
      key: 'hero',
      content: {
        eyebrow: 'COACHING · FOOTBALL · AUTONOMIE',
        title: 'Accompagnement physique & mental.',
        accent: 'À votre rythme.',
        description:
          'Accompagner, c’est cheminer à vos côtés en tenant compte de vos besoins. Que vous soyez sportif ou non, commencez à vous stimuler ou reprenez une activité adaptée à vos capacités, à vos besoins et à votre rythme.',
        location: 'YAA COACHING à Vierzon et alentours ; YAA PLAYER sans limite géographique.',
        buttonLabel: 'Trouver mon accompagnement',
      },
    },
    {
      key: 'services',
      content: {
        section: {
          eyebrow: 'UN ACCOMPAGNEMENT QUI VOUS RESSEMBLE',
          title: 'Trois portes.',
          accent: 'Un même élan.',
          introduction:
            'Pas besoin d’être sportif pour commencer. Votre point de départ, vos capacités et vos besoins guident chaque étape de l’accompagnement.',
        },
        items: services,
      },
    },
    {
      key: 'questionnaires',
      content: {
        items: Object.fromEntries(services.map(({ name }) => [name, getQuestionnaire(name)])),
      },
    },
    ...publicContentDefaults,
  ];

  for (const { key, content } of defaults) {
    const json = content as Prisma.InputJsonObject;
    const existing = await prisma.contentBlock.findUnique({ where: { key } });
    if (!existing) {
      await prisma.contentBlock.create({
        data: {
          key,
          content: json,
          publishedContent: json,
          publishedAt: new Date(),
        },
      });
      continue;
    }

    const nextContent = mergeMissingValues(existing.content, json) as Prisma.InputJsonObject;
    const nextPublished = existing.publishedAt
      ? (mergeMissingValues(existing.publishedContent, json) as Prisma.InputJsonObject)
      : null;
    const hasChanges =
      JSON.stringify(nextContent) !== JSON.stringify(existing.content) ||
      (nextPublished !== null &&
        JSON.stringify(nextPublished) !== JSON.stringify(existing.publishedContent));
    if (!hasChanges) continue;

    await prisma.$transaction(async (transaction) => {
      const block = await transaction.contentBlock.update({
        where: { key },
        data: {
          content: nextContent,
          ...(nextPublished ? { publishedContent: nextPublished } : {}),
          revision: { increment: 1 },
        },
      });
      await transaction.contentRevision.create({
        data: {
          contentBlockId: block.id,
          revision: block.revision,
          content: nextContent,
        },
      });
      await transaction.auditLog.create({
        data: {
          action: 'CONTENT_DEFAULTS_MERGED',
          entity: 'ContentBlock',
          entityId: block.id,
        },
      });
    });
  }
}

async function main() {
  const { email, password } = getAdminCredentials();

  await seedAdmin(email, password);
  const createdFaqs = await seedFaqs();
  await seedPublishedContent();
  const createdMedia = await seedMedia();

  console.info('Seed terminé : compte administrateur, contenus du site et FAQ initialisés.');
  console.info(`FAQ ajoutées : ${createdFaqs}.`);
  console.info(`Médias ajoutés : ${createdMedia}.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
