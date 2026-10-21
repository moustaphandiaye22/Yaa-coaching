import { serviceNames } from '../../services/domain/service-catalog.js';

export type ServiceName = (typeof serviceNames)[number];

export function isServiceName(value: unknown): value is ServiceName {
  return typeof value === 'string' && serviceNames.includes(value as ServiceName);
}
