/**
 * Current User Decorator
 *
 * Extract authenticated user from request
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../types/jwt.types';

/**
 * Decorator to get the current authenticated user from request
 *
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return user;
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): AuthenticatedUser | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    // If a specific property is requested, return only that
    if (data) {
      return user?.[data];
    }

    // Otherwise return the entire user object
    return user;
  }
);
