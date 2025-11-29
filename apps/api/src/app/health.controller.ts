import { Controller, Get } from '@nestjs/common';

/**
 * Health check controller for Docker and Kubernetes
 */
@Controller('health')
export class HealthController {
  /**
   * Health check endpoint
   * Returns 200 OK if the API is running
   */
  @Get()
  check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mykadoo-api',
    };
  }
}
