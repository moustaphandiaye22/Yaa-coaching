import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../../shared/http/async-handler.js';
import { readCookie } from '../../../shared/http/cookie.js';
import { LoginUser } from '../application/login-user.js';
import { createRequireAuthenticated } from '../../../shared/http/auth-middleware.js';
import { ManageSession } from '../application/manage-session.js';
import type { SessionStore } from '../domain/session.js';

export function createAuthRouter(
  session: ManageSession,
  loginUser: LoginUser,
  sessionStore: SessionStore,
) {
  const router = Router();
  const requireAuthenticated = createRequireAuthenticated(sessionStore);

  router.post(
    '/login',
    asyncHandler(async (request, response) => {
      const input = z
        .object({ email: z.string().email(), password: z.string().min(1).max(200) })
        .safeParse(request.body);
      if (!input.success) {
        response.status(400).json({ error: 'Adresse e-mail ou mot de passe invalide.' });
        return;
      }
      const session = await loginUser.execute(input.data.email, input.data.password);
      if (!session) {
        response.status(401).json({ error: 'Adresse e-mail ou mot de passe invalide.' });
        return;
      }

      response.setHeader(
        'Set-Cookie',
        `yaa_session=${session.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      );
      response.json({ email: session.email, role: session.role });
    }),
  );

  router.post(
    '/logout',
    asyncHandler(async (request, response) => {
      const token = readCookie(request, 'yaa_session');
      await session.logout(token);
      response.setHeader(
        'Set-Cookie',
        `yaa_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
      );
      response.status(204).end();
    }),
  );

  router.get(
    '/me',
    requireAuthenticated,
    asyncHandler(async (_request, response) => {
      const user = await session.currentUser(response.locals.userId, response.locals.userRole);
      if (!user) {
        response.status(401).json({ error: 'Connexion administrateur requise.' });
        return;
      }
      response.json(user);
    }),
  );

  return router;
}
