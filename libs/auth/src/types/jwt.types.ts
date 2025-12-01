/**
 * JWT Authentication Types
 *
 * Type definitions for JWT token management
 */

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  type: TokenType;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload extends JwtPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
  tokenId: string; // For token rotation tracking
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export enum UserRole {
  FREE = 'FREE',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  ADMIN = 'ADMIN',
}

export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string; // e.g., '15m'
  refreshTokenExpiry: string; // e.g., '7d'
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}
