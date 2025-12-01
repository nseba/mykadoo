/**
 * Google Auth Guard
 *
 * Protects routes that require Google OAuth authentication
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
