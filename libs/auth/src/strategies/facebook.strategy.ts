/**
 * Facebook OAuth Strategy
 *
 * Handles Facebook OAuth 2.0 authentication
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

export interface FacebookProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>(
        'FACEBOOK_CALLBACK_URL',
        'http://localhost:3000/api/auth/facebook/callback'
      ),
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user: FacebookProfile = {
      id,
      email: emails?.[0]?.value || '',
      name: name?.givenName + (name?.familyName ? ' ' + name.familyName : ''),
      avatar: photos?.[0]?.value,
    };

    done(null, user);
  }
}
