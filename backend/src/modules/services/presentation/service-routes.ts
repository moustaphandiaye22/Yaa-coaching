import { Router } from 'express';
import { services } from '../domain/service-catalog.js';

export const serviceRouter = Router();
serviceRouter.get('/', (_request, response) => response.json(services));
