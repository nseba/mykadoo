/**
 * Resend Verification Email DTO
 *
 * Validates email for resending verification
 */

import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
