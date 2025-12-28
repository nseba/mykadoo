import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * JWT Authentication Guard
 * Placeholder implementation - will be fully implemented in PRD 0002
 * For now, it checks for a user object on the request (set by middleware)
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check if user is attached to request (from JWT middleware or test setup)
    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('Authentication required');
    }

    return true;
  }
}
