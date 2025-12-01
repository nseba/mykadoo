/**
 * Auth Response DTO
 *
 * Standard response format for authentication endpoints
 */

import { UserRole } from '../types/jwt.types';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserInfoDto;
}

export class UserInfoDto {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
}
