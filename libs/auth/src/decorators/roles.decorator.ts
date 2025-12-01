/**
 * Roles Decorator
 *
 * Specify required roles for route access
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/jwt.types';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 *
 * @example
 * ```typescript
 * @Roles(UserRole.ADMIN)
 * @Get('admin')
 * adminOnly() {
 *   return { message: 'Admin access granted' };
 * }
 * ```
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
