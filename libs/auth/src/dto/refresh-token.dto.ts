/**
 * Refresh Token DTO
 *
 * Data transfer object for refreshing access token
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}
