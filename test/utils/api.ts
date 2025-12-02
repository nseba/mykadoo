/**
 * API Testing Utilities
 * 
 * Utilities for testing API endpoints with Supertest
 */

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

/**
 * Create test application
 */
export async function createTestApp(module: any): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [module],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

/**
 * Close test application
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}

/**
 * Create authenticated request
 */
export function authenticatedRequest(
  app: INestApplication,
  token: string
): request.SuperTest<request.Test> {
  return request(app.getHttpServer()).set('Authorization', `Bearer ${token}`);
}

/**
 * Create test JWT token
 */
export function createTestToken(payload: any): string {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  });
}

/**
 * API test helpers
 */
export const api = {
  get: (app: INestApplication, path: string) =>
    request(app.getHttpServer()).get(path),
  
  post: (app: INestApplication, path: string, body?: any) =>
    request(app.getHttpServer()).post(path).send(body),
  
  put: (app: INestApplication, path: string, body?: any) =>
    request(app.getHttpServer()).put(path).send(body),
  
  patch: (app: INestApplication, path: string, body?: any) =>
    request(app.getHttpServer()).patch(path).send(body),
  
  delete: (app: INestApplication, path: string) =>
    request(app.getHttpServer()).delete(path),
};

/**
 * Expect API response helpers
 */
export const expectResponse = {
  success: (response: request.Response) => {
    expect(response.status).toBeLessThan(400);
    return response;
  },
  
  created: (response: request.Response) => {
    expect(response.status).toBe(201);
    return response;
  },
  
  badRequest: (response: request.Response) => {
    expect(response.status).toBe(400);
    return response;
  },
  
  unauthorized: (response: request.Response) => {
    expect(response.status).toBe(401);
    return response;
  },
  
  forbidden: (response: request.Response) => {
    expect(response.status).toBe(403);
    return response;
  },
  
  notFound: (response: request.Response) => {
    expect(response.status).toBe(404);
    return response;
  },
};
