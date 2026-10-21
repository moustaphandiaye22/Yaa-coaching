import type { NextFunction, Request, Response } from 'express';
import type { SessionStore } from '../../modules/auth/domain/session.js';
import { readCookie } from './cookie.js';

declare global {
  namespace Express {
    interface Locals {
      userId?: string;
      userRole?: 'ADMIN' | 'COACH';
    }
  }
}

export function createRequireAuthenticated(sessionStore: SessionStore) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const authenticate = async () => {
      const token = readCookie(request, 'yaa_session');
      const session = token ? await sessionStore.find(token) : null;
      if (!session) {
        response.status(401).json({ error: 'Connexion administrateur requise.' });
        return;
      }
      response.locals.userId = session.userId;
      response.locals.userRole = session.role;
      next();
    };
    void authenticate().catch(next);
  };
}

export function createRequireAdmin(sessionStore: SessionStore) {
  const requireAuthenticated = createRequireAuthenticated(sessionStore);
  return (request: Request, response: Response, next: NextFunction): void => {
    requireAuthenticated(request, response, (error?: unknown) => {
      if (error) {
        next(error);
        return;
      }
      if (response.locals.userRole !== 'ADMIN') {
        response.status(403).json({ error: 'Accès réservé à l’administration.' });
        return;
      }
      next();
    });
  };
}
