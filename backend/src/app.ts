import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './shared/database/prisma.js';
import { PrismaDatabaseHealthRepository } from './shared/database/database-health-repository.js';
import { errorHandler } from './shared/http/error-handler.js';
import { PrismaSessionStore } from './modules/auth/infrastructure/prisma-session-store.js';
import { PrismaUserRepository } from './modules/auth/infrastructure/prisma-user-repository.js';
import { Argon2PasswordVerifier } from './modules/auth/infrastructure/argon2-password-verifier.js';
import { LoginUser } from './modules/auth/application/login-user.js';
import { ManageSession } from './modules/auth/application/manage-session.js';
import { createAuthRouter } from './modules/auth/presentation/auth-routes.js';
import {
  createAdminSubmissionRouter,
  createPublicSubmissionRouter,
  createSubmissionRouter,
} from './modules/submissions/presentation/submission-routes.js';
import { PrismaSubmissionRepository } from './modules/submissions/infrastructure/prisma-submission-repository.js';
import { SubmitSubmission } from './modules/submissions/application/submit-submission.js';
import { ManageSubmissions } from './modules/submissions/application/manage-submissions.js';
import {
  createAdminReviewRouter,
  createPublicReviewRouter,
  createReviewRouter,
} from './modules/reviews/presentation/review-routes.js';
import { PrismaReviewRepository } from './modules/reviews/infrastructure/prisma-review-repository.js';
import { SubmitReview } from './modules/reviews/application/submit-review.js';
import { ManageReviews } from './modules/reviews/application/manage-reviews.js';
import {
  createAdminFaqRouter,
  createPublicFaqRouter,
  createFaqRouter,
} from './modules/faqs/presentation/faq-routes.js';
import { PrismaFaqRepository } from './modules/faqs/infrastructure/prisma-faq-repository.js';
import { ManageFaqs } from './modules/faqs/application/manage-faqs.js';
import {
  createAdminContentRouter,
  createContentRouter,
  createPublicContentRouter,
} from './modules/content/presentation/content-routes.js';
import { PrismaContentRepository } from './modules/content/infrastructure/prisma-content-repository.js';
import { ManageContent } from './modules/content/application/manage-content.js';
import {
  createAdminMediaRouter,
  createMediaRouter,
  createPublicMediaRouter,
} from './modules/media/presentation/media-routes.js';
import { PrismaMediaRepository } from './modules/media/infrastructure/prisma-media-repository.js';
import { ManageMedia, ReadPublicMedia } from './modules/media/application/manage-media.js';
import { createAuditRouter } from './modules/audit/presentation/audit-routes.js';
import { PrismaAuditRepository } from './modules/audit/infrastructure/prisma-audit-repository.js';
import { ReadAuditLog } from './modules/audit/application/read-audit-log.js';
import { createServiceRouter } from './modules/services/presentation/service-routes.js';
import { asyncHandler } from './shared/http/async-handler.js';
import { createQuestionnaireRouter } from './modules/questionnaire/presentation/questionnaire-routes.js';
import { ReadQuestionnaire } from './modules/questionnaire/application/read-questionnaire.js';
import { LocalMediaStorage } from './modules/media/infrastructure/local-media-storage.js';
import { createAdminUserRouter } from './modules/users/presentation/user-routes.js';
import { PrismaUserManagementRepository } from './modules/users/infrastructure/prisma-user-management-repository.js';
import { Argon2PasswordHasher } from './modules/auth/infrastructure/argon2-password-hasher.js';
import { ResendNotificationDispatcher } from './modules/notifications/infrastructure/resend-notification-dispatcher.js';
import { createAdminNotificationRouter } from './modules/notifications/presentation/notification-routes.js';
import { PrismaNotificationRepository } from './modules/notifications/infrastructure/prisma-notification-repository.js';
import { ManageNotifications } from './modules/notifications/application/manage-notifications.js';
import { ManageUsers } from './modules/users/application/manage-users.js';

const app = express();
const databaseHealth = new PrismaDatabaseHealthRepository(prisma);
const sessions = new PrismaSessionStore(prisma);
const users = new PrismaUserRepository(prisma);
const loginUser = new LoginUser(users, new Argon2PasswordVerifier(), sessions);
const manageSession = new ManageSession(users, sessions);
const frontendOrigins = new Set(
  (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);
if (process.env.VERCEL_URL) {
  const deploymentUrl = process.env.VERCEL_URL.startsWith('http')
    ? process.env.VERCEL_URL
    : `https://${process.env.VERCEL_URL}`;
  frontendOrigins.add(new URL(deploymentUrl).origin);
}
const isAllowedFrontendOrigin = (origin: string) => frontendOrigins.has(origin);
const mediaStorage = new LocalMediaStorage();

app.disable('x-powered-by');
app.use(
  helmet({
    strictTransportSecurity: process.env.NODE_ENV === 'production' ? undefined : false,
  }),
);
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, origin && isAllowedFrontendOrigin(origin) ? origin : false),
    credentials: true,
  }),
);
app.use((request, response, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const origin = request.get('origin');
  if (isMutation && origin && !isAllowedFrontendOrigin(origin)) {
    response.status(403).json({ error: 'Origine de la requête refusée.' });
    return;
  }
  next();
});
app.use(express.json({ limit: '80kb' }));
app.use(
  '/media',
  express.static(mediaStorage.root, {
    dotfiles: 'deny',
    index: false,
    redirect: false,
    fallthrough: false,
    maxAge: '7d',
    immutable: true,
    setHeaders: (response) => {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Content-Disposition', 'inline');
    },
  }),
);
app.use(
  '/api/auth/login',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }),
);
app.use(
  [
    '/api/submissions/public',
    '/api/reviews/public',
    '/api/public/submissions',
    '/api/public/reviews',
  ],
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (request) => request.method !== 'POST',
  }),
);
app.use(
  '/api/admin/media/upload',
  rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }),
);

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.get(
  '/api/ready',
  asyncHandler(async (_request, response) => {
    const ready = await databaseHealth.isReady();
    response.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not-ready' });
  }),
);
app.use('/api/auth', createAuthRouter(manageSession, loginUser, sessions));
const submissions = new PrismaSubmissionRepository(prisma);
const submitSubmission = new SubmitSubmission(submissions);
const manageSubmissions = new ManageSubmissions(submissions);
const reviews = new PrismaReviewRepository(prisma);
const submitReview = new SubmitReview(reviews);
const manageReviews = new ManageReviews(reviews);
const faqs = new PrismaFaqRepository(prisma);
const manageFaqs = new ManageFaqs(faqs);
const content = new PrismaContentRepository(prisma);
const manageContent = new ManageContent(content);
const media = new PrismaMediaRepository(prisma);
const manageMedia = new ManageMedia(media, mediaStorage);
const readPublicMedia = new ReadPublicMedia(media);
app.use('/api/submissions', createSubmissionRouter(submitSubmission, manageSubmissions, sessions));
app.use('/api/public/submissions', createPublicSubmissionRouter(submitSubmission));
app.use('/api/admin/submissions', createAdminSubmissionRouter(manageSubmissions, sessions));
app.use('/api/reviews', createReviewRouter(submitReview, manageReviews, sessions));
app.use('/api/public/reviews', createPublicReviewRouter(submitReview, manageReviews));
app.use('/api/admin/reviews', createAdminReviewRouter(manageReviews, sessions));
app.use('/api/faqs', createFaqRouter(manageFaqs, sessions));
app.use('/api/public/faqs', createPublicFaqRouter(manageFaqs));
app.use('/api/admin/faqs', createAdminFaqRouter(manageFaqs, sessions));
app.use('/api/content', createContentRouter(manageContent, sessions));
app.use('/api/public/site', createPublicContentRouter(manageContent));
app.use('/api/admin/content', createAdminContentRouter(manageContent, sessions));
app.use('/api/media', createMediaRouter(manageMedia, readPublicMedia, sessions));
app.use('/api/admin/media', createAdminMediaRouter(manageMedia, sessions));
app.use('/api/public/media', createPublicMediaRouter(readPublicMedia));
app.use('/api/services', createServiceRouter(manageContent));
app.use('/api/public/services', createServiceRouter(manageContent));
app.use(
  '/api/public/questionnaire',
  createQuestionnaireRouter(new ReadQuestionnaire(manageContent)),
);
app.use(
  '/api/admin/audit',
  createAuditRouter(new ReadAuditLog(new PrismaAuditRepository(prisma)), sessions),
);
const userManager = new ManageUsers(
  new PrismaUserManagementRepository(prisma),
  new Argon2PasswordHasher(),
);
app.use('/api/admin/users', createAdminUserRouter(userManager, sessions));
const notificationRepository = new PrismaNotificationRepository(prisma);
const notificationDispatcher = new ResendNotificationDispatcher(notificationRepository);
const manageNotifications = new ManageNotifications(notificationRepository, notificationDispatcher);
app.use('/api/admin/notifications', createAdminNotificationRouter(manageNotifications, sessions));
app.use(errorHandler);

export { app };
