/**
 * Facebook Auth Guard
 *
 * Protects routes that require Facebook OAuth authentication
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {}
