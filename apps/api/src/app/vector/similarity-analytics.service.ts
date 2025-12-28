import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../common/prisma';

/**
 * Types of similarity search events
 */
export enum SimilarityEventType {
  SEARCH = 'similarity_search',
  IMPRESSION = 'similarity_impression',
  CLICK = 'similarity_click',
  CONVERSION = 'similarity_conversion',
}

/**
 * A/B test variant for similarity recommendations
 */
export enum RecommendationVariant {
  CONTROL = 'control', // No recommendations
  BASIC = 'basic', // Basic similarity only
  HYBRID = 'hybrid', // Hybrid search (keyword + semantic)
  PERSONALIZED = 'personalized', // User-personalized recommendations
}

/**
 * Similarity search event data
 */
export interface SimilarityEvent {
  eventType: SimilarityEventType;
  sourceProductId: string;
  userId?: string;
  sessionId?: string;
  variant: RecommendationVariant;
  timestamp: Date;
  metadata?: {
    recommendedProductIds?: string[];
    clickedProductId?: string;
    position?: number;
    searchThreshold?: number;
    totalResults?: number;
  };
}

/**
 * Similarity analytics metrics
 */
export interface SimilarityMetrics {
  period: string;
  totalSearches: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averagePosition: number;
  byVariant: VariantMetrics[];
  topSourceProducts: ProductAnalytics[];
  topRecommendedProducts: ProductAnalytics[];
}

/**
 * Metrics per A/B test variant
 */
export interface VariantMetrics {
  variant: RecommendationVariant;
  searches: number;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  conversionRate: number;
  averagePosition: number;
}

/**
 * Product-level analytics
 */
export interface ProductAnalytics {
  productId: string;
  productTitle?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  clickThroughRate: number;
  revenue?: number;
}

/**
 * A/B test configuration
 */
export interface ABTestConfig {
  name: string;
  description: string;
  variants: RecommendationVariant[];
  weights: number[];
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

/**
 * Service for tracking and analyzing similarity search performance
 */
@Injectable()
export class SimilarityAnalyticsService {
  private readonly logger = new Logger(SimilarityAnalyticsService.name);
  private readonly eventsBuffer: SimilarityEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  // Default A/B test configuration
  private currentABTest: ABTestConfig = {
    name: 'similarity_v1',
    description: 'Initial similarity recommendation A/B test',
    variants: [
      RecommendationVariant.CONTROL,
      RecommendationVariant.BASIC,
      RecommendationVariant.HYBRID,
      RecommendationVariant.PERSONALIZED,
    ],
    weights: [0.1, 0.3, 0.3, 0.3], // 10% control, 30% each treatment
    startDate: new Date(),
    isActive: true,
  };

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    this.startPeriodicFlush();
  }

  /**
   * Assign user to A/B test variant
   */
  assignVariant(userId?: string, sessionId?: string): RecommendationVariant {
    if (!this.currentABTest.isActive) {
      return RecommendationVariant.HYBRID; // Default when no test active
    }

    // Deterministic assignment based on user/session ID
    const identifier = userId || sessionId || Math.random().toString();
    const hash = this.simpleHash(identifier);
    const normalized = (hash % 1000) / 1000;

    let cumulative = 0;
    for (let i = 0; i < this.currentABTest.variants.length; i++) {
      cumulative += this.currentABTest.weights[i];
      if (normalized < cumulative) {
        return this.currentABTest.variants[i];
      }
    }

    return RecommendationVariant.BASIC;
  }

  /**
   * Track similarity search event
   */
  async trackSearch(
    sourceProductId: string,
    options: {
      userId?: string;
      sessionId?: string;
      variant: RecommendationVariant;
      recommendedProductIds: string[];
      searchThreshold?: number;
    }
  ): Promise<void> {
    const event: SimilarityEvent = {
      eventType: SimilarityEventType.SEARCH,
      sourceProductId,
      userId: options.userId,
      sessionId: options.sessionId,
      variant: options.variant,
      timestamp: new Date(),
      metadata: {
        recommendedProductIds: options.recommendedProductIds,
        searchThreshold: options.searchThreshold,
        totalResults: options.recommendedProductIds.length,
      },
    };

    await this.bufferEvent(event);
    this.logger.debug(`Tracked similarity search for product ${sourceProductId}`);
  }

  /**
   * Track impression (user saw recommendations)
   */
  async trackImpression(
    sourceProductId: string,
    recommendedProductIds: string[],
    options: {
      userId?: string;
      sessionId?: string;
      variant: RecommendationVariant;
    }
  ): Promise<void> {
    const event: SimilarityEvent = {
      eventType: SimilarityEventType.IMPRESSION,
      sourceProductId,
      userId: options.userId,
      sessionId: options.sessionId,
      variant: options.variant,
      timestamp: new Date(),
      metadata: {
        recommendedProductIds,
        totalResults: recommendedProductIds.length,
      },
    };

    await this.bufferEvent(event);
    this.logger.debug(
      `Tracked ${recommendedProductIds.length} impressions for product ${sourceProductId}`
    );
  }

  /**
   * Track click on recommended product
   */
  async trackClick(
    sourceProductId: string,
    clickedProductId: string,
    position: number,
    options: {
      userId?: string;
      sessionId?: string;
      variant: RecommendationVariant;
    }
  ): Promise<void> {
    const event: SimilarityEvent = {
      eventType: SimilarityEventType.CLICK,
      sourceProductId,
      userId: options.userId,
      sessionId: options.sessionId,
      variant: options.variant,
      timestamp: new Date(),
      metadata: {
        clickedProductId,
        position,
      },
    };

    await this.bufferEvent(event);
    this.logger.debug(
      `Tracked click on recommended product ${clickedProductId} from ${sourceProductId} at position ${position}`
    );
  }

  /**
   * Track conversion from recommendation
   */
  async trackConversion(
    sourceProductId: string,
    convertedProductId: string,
    options: {
      userId?: string;
      sessionId?: string;
      variant: RecommendationVariant;
      position?: number;
    }
  ): Promise<void> {
    const event: SimilarityEvent = {
      eventType: SimilarityEventType.CONVERSION,
      sourceProductId,
      userId: options.userId,
      sessionId: options.sessionId,
      variant: options.variant,
      timestamp: new Date(),
      metadata: {
        clickedProductId: convertedProductId,
        position: options.position,
      },
    };

    await this.bufferEvent(event);
    this.logger.log(
      `Tracked conversion from recommendation: ${convertedProductId} from ${sourceProductId}`
    );
  }

  /**
   * Get similarity analytics metrics
   */
  async getMetrics(
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<SimilarityMetrics> {
    const cacheKey = `similarity_metrics:${startDate.toISOString()}:${endDate.toISOString()}`;
    const cached = await this.cacheManager.get<SimilarityMetrics>(cacheKey);
    if (cached) {
      return cached;
    }

    // Flush any pending events first
    await this.flushEvents();

    const events = await this.getEventsFromDatabase(startDate, endDate);

    const metrics = this.calculateMetrics(events, startDate, endDate);

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, metrics, 300000);

    return metrics;
  }

  /**
   * Get A/B test results
   */
  async getABTestResults(testName?: string): Promise<{
    testName: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    results: VariantMetrics[];
    winner?: RecommendationVariant;
    significance?: number;
  }> {
    const test = testName ? await this.getTestConfig(testName) : this.currentABTest;
    const endDate = test.endDate || new Date();

    const metrics = await this.getMetrics(test.startDate, endDate);

    // Determine winner based on conversion rate
    const results = metrics.byVariant;
    let winner: RecommendationVariant | undefined;
    let highestConversionRate = 0;

    for (const variant of results) {
      if (variant.conversionRate > highestConversionRate && variant.clicks > 100) {
        highestConversionRate = variant.conversionRate;
        winner = variant.variant;
      }
    }

    // Calculate statistical significance (simplified chi-square test)
    const significance = this.calculateSignificance(results);

    return {
      testName: test.name,
      startDate: test.startDate,
      endDate: test.endDate,
      isActive: test.isActive,
      results,
      winner: significance > 0.95 ? winner : undefined,
      significance,
    };
  }

  /**
   * Get top performing source products (products that generate good recommendations)
   */
  async getTopSourceProducts(
    startDate: Date,
    endDate: Date = new Date(),
    limit: number = 10
  ): Promise<ProductAnalytics[]> {
    const metrics = await this.getMetrics(startDate, endDate);
    return metrics.topSourceProducts.slice(0, limit);
  }

  /**
   * Get top recommended products (products frequently recommended and clicked)
   */
  async getTopRecommendedProducts(
    startDate: Date,
    endDate: Date = new Date(),
    limit: number = 10
  ): Promise<ProductAnalytics[]> {
    const metrics = await this.getMetrics(startDate, endDate);
    return metrics.topRecommendedProducts.slice(0, limit);
  }

  /**
   * Update A/B test configuration
   */
  async updateABTest(config: Partial<ABTestConfig>): Promise<ABTestConfig> {
    this.currentABTest = {
      ...this.currentABTest,
      ...config,
    };

    this.logger.log(`Updated A/B test configuration: ${this.currentABTest.name}`);
    return this.currentABTest;
  }

  /**
   * End current A/B test
   */
  async endABTest(): Promise<ABTestConfig> {
    this.currentABTest.endDate = new Date();
    this.currentABTest.isActive = false;

    this.logger.log(`Ended A/B test: ${this.currentABTest.name}`);
    return this.currentABTest;
  }

  /**
   * Get current A/B test configuration
   */
  getCurrentABTest(): ABTestConfig {
    return this.currentABTest;
  }

  // Private helper methods

  private async bufferEvent(event: SimilarityEvent): Promise<void> {
    this.eventsBuffer.push(event);

    if (this.eventsBuffer.length >= this.BUFFER_SIZE) {
      await this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventsBuffer.length === 0) {
      return;
    }

    const events = [...this.eventsBuffer];
    this.eventsBuffer.length = 0;

    try {
      // Store events in database
      await this.prisma.$executeRaw`
        INSERT INTO similarity_events (event_type, source_product_id, user_id, session_id, variant, timestamp, metadata)
        SELECT * FROM UNNEST(
          ${events.map(e => e.eventType)}::text[],
          ${events.map(e => e.sourceProductId)}::text[],
          ${events.map(e => e.userId || null)}::text[],
          ${events.map(e => e.sessionId || null)}::text[],
          ${events.map(e => e.variant)}::text[],
          ${events.map(e => e.timestamp)}::timestamp[],
          ${events.map(e => JSON.stringify(e.metadata || {}))}::jsonb[]
        )
      `;

      this.logger.debug(`Flushed ${events.length} similarity events to database`);
    } catch (error) {
      // If table doesn't exist, log warning and continue (events lost)
      this.logger.warn(`Failed to flush similarity events: ${error.message}`);
      // Re-add events to buffer for retry (up to buffer size)
      if (this.eventsBuffer.length < this.BUFFER_SIZE) {
        this.eventsBuffer.push(...events.slice(0, this.BUFFER_SIZE - this.eventsBuffer.length));
      }
    }
  }

  private async getEventsFromDatabase(
    startDate: Date,
    endDate: Date
  ): Promise<SimilarityEvent[]> {
    try {
      const events = await this.prisma.$queryRaw<
        Array<{
          event_type: string;
          source_product_id: string;
          user_id: string | null;
          session_id: string | null;
          variant: string;
          timestamp: Date;
          metadata: Record<string, unknown>;
        }>
      >`
        SELECT event_type, source_product_id, user_id, session_id, variant, timestamp, metadata
        FROM similarity_events
        WHERE timestamp >= ${startDate} AND timestamp <= ${endDate}
        ORDER BY timestamp ASC
      `;

      return events.map(e => ({
        eventType: e.event_type as SimilarityEventType,
        sourceProductId: e.source_product_id,
        userId: e.user_id || undefined,
        sessionId: e.session_id || undefined,
        variant: e.variant as RecommendationVariant,
        timestamp: e.timestamp,
        metadata: e.metadata as SimilarityEvent['metadata'],
      }));
    } catch (error) {
      this.logger.warn(`Failed to get events from database: ${error.message}`);
      return [];
    }
  }

  private calculateMetrics(
    events: SimilarityEvent[],
    startDate: Date,
    endDate: Date
  ): SimilarityMetrics {
    const searches = events.filter(e => e.eventType === SimilarityEventType.SEARCH);
    const impressions = events.filter(e => e.eventType === SimilarityEventType.IMPRESSION);
    const clicks = events.filter(e => e.eventType === SimilarityEventType.CLICK);
    const conversions = events.filter(e => e.eventType === SimilarityEventType.CONVERSION);

    const totalSearches = searches.length;
    const totalImpressions = impressions.reduce(
      (sum, e) => sum + (e.metadata?.totalResults || 0),
      0
    );
    const totalClicks = clicks.length;
    const totalConversions = conversions.length;

    const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const positions = clicks
      .filter(e => e.metadata?.position !== undefined)
      .map(e => e.metadata!.position!);
    const averagePosition =
      positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0;

    // Calculate per-variant metrics
    const byVariant = this.calculateVariantMetrics(events);

    // Calculate top products
    const topSourceProducts = this.calculateSourceProductMetrics(events);
    const topRecommendedProducts = this.calculateRecommendedProductMetrics(events);

    return {
      period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
      totalSearches,
      totalImpressions,
      totalClicks,
      totalConversions,
      clickThroughRate,
      conversionRate,
      averagePosition,
      byVariant,
      topSourceProducts,
      topRecommendedProducts,
    };
  }

  private calculateVariantMetrics(events: SimilarityEvent[]): VariantMetrics[] {
    const variants = Object.values(RecommendationVariant);
    const metrics: VariantMetrics[] = [];

    for (const variant of variants) {
      const variantEvents = events.filter(e => e.variant === variant);
      const searches = variantEvents.filter(e => e.eventType === SimilarityEventType.SEARCH);
      const impressions = variantEvents.filter(
        e => e.eventType === SimilarityEventType.IMPRESSION
      );
      const clicks = variantEvents.filter(e => e.eventType === SimilarityEventType.CLICK);
      const conversions = variantEvents.filter(
        e => e.eventType === SimilarityEventType.CONVERSION
      );

      const totalImpressions = impressions.reduce(
        (sum, e) => sum + (e.metadata?.totalResults || 0),
        0
      );

      const positions = clicks
        .filter(e => e.metadata?.position !== undefined)
        .map(e => e.metadata!.position!);

      metrics.push({
        variant,
        searches: searches.length,
        impressions: totalImpressions,
        clicks: clicks.length,
        conversions: conversions.length,
        clickThroughRate: totalImpressions > 0 ? (clicks.length / totalImpressions) * 100 : 0,
        conversionRate: clicks.length > 0 ? (conversions.length / clicks.length) * 100 : 0,
        averagePosition:
          positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : 0,
      });
    }

    return metrics;
  }

  private calculateSourceProductMetrics(events: SimilarityEvent[]): ProductAnalytics[] {
    const productMap = new Map<string, ProductAnalytics>();

    for (const event of events) {
      if (!productMap.has(event.sourceProductId)) {
        productMap.set(event.sourceProductId, {
          productId: event.sourceProductId,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          clickThroughRate: 0,
        });
      }

      const metrics = productMap.get(event.sourceProductId)!;

      if (event.eventType === SimilarityEventType.IMPRESSION) {
        metrics.impressions += event.metadata?.totalResults || 0;
      } else if (event.eventType === SimilarityEventType.CLICK) {
        metrics.clicks++;
      } else if (event.eventType === SimilarityEventType.CONVERSION) {
        metrics.conversions++;
      }
    }

    // Calculate CTR and sort
    const products = Array.from(productMap.values());
    for (const product of products) {
      product.clickThroughRate =
        product.impressions > 0 ? (product.clicks / product.impressions) * 100 : 0;
    }

    return products.sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  }

  private calculateRecommendedProductMetrics(events: SimilarityEvent[]): ProductAnalytics[] {
    const productMap = new Map<string, ProductAnalytics>();

    // Track impressions from search/impression events
    for (const event of events) {
      if (
        event.eventType === SimilarityEventType.SEARCH ||
        event.eventType === SimilarityEventType.IMPRESSION
      ) {
        const recommendedIds = event.metadata?.recommendedProductIds || [];
        for (const productId of recommendedIds) {
          if (!productMap.has(productId)) {
            productMap.set(productId, {
              productId,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              clickThroughRate: 0,
            });
          }
          productMap.get(productId)!.impressions++;
        }
      }

      // Track clicks and conversions
      if (
        event.eventType === SimilarityEventType.CLICK ||
        event.eventType === SimilarityEventType.CONVERSION
      ) {
        const clickedId = event.metadata?.clickedProductId;
        if (clickedId) {
          if (!productMap.has(clickedId)) {
            productMap.set(clickedId, {
              productId: clickedId,
              impressions: 0,
              clicks: 0,
              conversions: 0,
              clickThroughRate: 0,
            });
          }

          const metrics = productMap.get(clickedId)!;
          if (event.eventType === SimilarityEventType.CLICK) {
            metrics.clicks++;
          } else {
            metrics.conversions++;
          }
        }
      }
    }

    // Calculate CTR and sort
    const products = Array.from(productMap.values());
    for (const product of products) {
      product.clickThroughRate =
        product.impressions > 0 ? (product.clicks / product.impressions) * 100 : 0;
    }

    return products.sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  }

  private calculateSignificance(results: VariantMetrics[]): number {
    // Simplified statistical significance calculation
    // In production, use proper chi-square or t-test
    const control = results.find(r => r.variant === RecommendationVariant.CONTROL);
    if (!control || control.clicks < 100) {
      return 0;
    }

    let maxDiff = 0;
    for (const variant of results) {
      if (variant.variant !== RecommendationVariant.CONTROL && variant.clicks >= 100) {
        const diff = Math.abs(variant.conversionRate - control.conversionRate);
        if (diff > maxDiff) {
          maxDiff = diff;
        }
      }
    }

    // Rough approximation - proper implementation would use z-test
    if (maxDiff > 5) return 0.99;
    if (maxDiff > 3) return 0.95;
    if (maxDiff > 2) return 0.9;
    if (maxDiff > 1) return 0.8;
    return 0.5;
  }

  private async getTestConfig(testName: string): Promise<ABTestConfig> {
    // In production, this would fetch from database
    if (testName === this.currentABTest.name) {
      return this.currentABTest;
    }
    throw new Error(`A/B test not found: ${testName}`);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents().catch(err => {
        this.logger.error(`Periodic flush failed: ${err.message}`);
      });
    }, this.FLUSH_INTERVAL);
  }

  onModuleDestroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // Final flush
    this.flushEvents().catch(err => {
      this.logger.error(`Final flush failed: ${err.message}`);
    });
  }
}
