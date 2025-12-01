/**
 * JWT Service
 *
 * Handles JWT token generation, validation, and refresh
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  JwtPayload,
  TokenPair,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenType,
  AuthenticatedUser,
} from '../types/jwt.types';
import { randomUUID } from 'crypto';

@Injectable()
export class JwtTokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService
  ) {
    this.accessTokenSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'access-secret-change-me');
    this.refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'refresh-secret-change-me');
    this.accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m');
    this.refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d');
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(user: AuthenticatedUser): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate access token
   */
  private async generateAccessToken(user: AuthenticatedUser): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: TokenType.ACCESS,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * Generate refresh token with rotation tracking
   */
  private async generateRefreshToken(user: AuthenticatedUser): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: TokenType.REFRESH,
      tokenId: randomUUID(), // For token rotation
    };

    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiry,
    });
  }

  /**
   * Verify and decode access token
   */
  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.accessTokenSecret,
      });

      if (payload.type !== TokenType.ACCESS) {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  /**
   * Verify and decode refresh token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.refreshTokenSecret,
      });

      if (payload.type !== TokenType.REFRESH) {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Verify refresh token
    const payload = await this.verifyRefreshToken(refreshToken);

    // Generate new token pair (token rotation)
    const user: AuthenticatedUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return this.generateTokenPair(user);
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  getTokenExpiration(token: string): number | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return decoded.exp;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const exp = this.getTokenExpiration(token);
    if (!exp) {
      return true;
    }
    return Date.now() >= exp * 1000;
  }
}
