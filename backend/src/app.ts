import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { prisma } from './shared/database/prisma.js';
import { errorHandler } from './shared/http/error-handler.js';
import { PrismaSessionStore } from './modules/auth/infrastructure/prisma-session-store.js';
import { PrismaUserRepository } from './modules/auth/infrastructure/prisma-user-repository.js';
import { Argon2PasswordVerifier } from './modules/auth/infrastructure/argon2-password-verifier.js';
import { LoginUser } from './modules/auth/application/login-user.js';
import { createAuthRouter } from './modules/auth/presentation/auth-routes.js';
import { createAdminSubmissionRouter, createPublicSubmissionRouter, createSubmissionRouter } from './modules/submissions/presentation/submission-routes.js';
import { PrismaSubmissionRepository } from './modules/submissions/infrastructure/prisma-submission-repository.js';
import { createAdminReviewRouter, createPublicReviewRouter, createReviewRouter } from './modules/reviews/presentation/review-routes.js';
import { PrismaReviewRepository } from './modules/reviews/infrastructure/prisma-review-repository.js';
import { createAdminFaqRouter, createPublicFaqRouter, createFaqRouter } from './modules/faqs/presentation/faq-routes.js';
import { PrismaFaqRepository } from './modules/faqs/infrastructure/prisma-faq-repository.js';
import { createAdminContentRouter, createContentRouter, createPublicContentRouter } from './modules/content/presentation/content-routes.js';
import { PrismaContentRepository } from './modules/content/infrastructure/prisma-content-repository.js';
import { createAdminMediaRouter, createMediaRouter, createPublicMediaRouter } from './modules/media/presentation/media-routes.js';
import { PrismaMediaRepository } from './modules/media/infrastructure/prisma-media-repository.js';
import { createAuditRouter } from './modules/audit/presentation/audit-routes.js';
import { PrismaAuditRepository } from './modules/audit/infrastructure/prisma-audit-repository.js';
import { serviceRouter } from './modules/services/presentation/service-routes.js';
import { asyncHandler } from './shared/http/async-handler.js';
import { questionnaireRouter } from './modules/questionnaire/presentation/questionnaire-routes.js';
import { LocalMediaStorage } from './modules/media/infrastructure/local-media-storage.js';
import { createAdminUserRouter } from './modules/users/presentation/user-routes.js';
import { PrismaUserManagementRepository } from './modules/users/infrastructure/prisma-user-management-repository.js';
import { Argon2PasswordHasher } from './modules/auth/infrastructure/argon2-password-hasher.js';
import { ResendNotificationDispatcher } from './modules/notifications/infrastructure/resend-notification-dispatcher.js';
import { createAdminNotificationRouter } from './modules/notifications/presentation/notification-routes.js';

const app = express();
const sessions = new PrismaSessionStore(prisma);
const users = new PrismaUserRepository(prisma);
const loginUser = new LoginUser(users, new Argon2PasswordVerifier(), sessions);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const mediaStorage = new LocalMediaStorage();

app.disable('x-powered-by');
app.use(helmet({
  strictTransportSecurity: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use((request, response, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const origin = request.get('origin');
  if (isMutation && origin && origin !== frontendOrigin) {
    response.status(403).json({ error: 'Origine de la requête refusée.' });
    return;
  }
  next();
});
app.use(express.json({ limit: '80kb' }));
app.use('/media', express.static(mediaStorage.root, {
  dotfiles: 'deny', index: false, redirect: false, fallthrough: false, maxAge: '7d', immutable: true,
  setHeaders: (response) => { response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Content-Disposition', 'inline'); }
}));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }));
app.use(['/api/submissions/public', '/api/reviews/public', '/api/public/submissions', '/api/public/reviews'], rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }));
app.use('/api/admin/media/upload', rateLimit({ windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.get('/api/ready', asyncHandler(async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: 'ready' });
  } catch {
    response.status(503).json({ status: 'not-ready' });
  }
}));
app.use('/api/auth', createAuthRouter(users, loginUser, sessions));
const submissions = new PrismaSubmissionRepository(prisma);
const reviews = new PrismaReviewRepository(prisma);
const faqs = new PrismaFaqRepository(prisma);
const content = new PrismaContentRepository(prisma);
const media = new PrismaMediaRepository(prisma);
app.use('/api/submissions', createSubmissionRouter(submissions, sessions));
app.use('/api/public/submissions', createPublicSubmissionRouter(submissions));
app.use('/api/admin/submissions', createAdminSubmissionRouter(submissions, sessions));
app.use('/api/reviews', createReviewRouter(reviews, sessions));
app.use('/api/public/reviews', createPublicReviewRouter(reviews));
app.use('/api/admin/reviews', createAdminReviewRouter(reviews, sessions));
app.use('/api/faqs', createFaqRouter(faqs, sessions));
app.use('/api/public/faqs', createPublicFaqRouter(faqs));
app.use('/api/admin/faqs', createAdminFaqRouter(faqs, sessions));
app.use('/api/content', createContentRouter(content, sessions));
app.use('/api/public/site', createPublicContentRouter(content));
app.use('/api/admin/content', createAdminContentRouter(content, sessions));
app.use('/api/media', createMediaRouter(media, sessions, mediaStorage));
app.use('/api/admin/media', createAdminMediaRouter(media, sessions, mediaStorage));
app.use('/api/public/media', createPublicMediaRouter(media));
app.use('/api/services', serviceRouter);
app.use('/api/public/services', serviceRouter);
app.use('/api/public/questionnaire', questionnaireRouter);
app.use('/api/admin/audit', createAuditRouter(new PrismaAuditRepository(prisma), sessions));
app.use('/api/admin/users', createAdminUserRouter(new PrismaUserManagementRepository(prisma), sessions, new Argon2PasswordHasher()));
const notificationDispatcher = new ResendNotificationDispatcher(prisma);
app.use('/api/admin/notifications', createAdminNotificationRouter(prisma, sessions, notificationDispatcher));
app.use(errorHandler);

export { app };
