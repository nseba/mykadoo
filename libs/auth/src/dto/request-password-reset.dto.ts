/**
 * Request Password Reset DTO
 *
 * Validates email input for password reset request
 */

import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
