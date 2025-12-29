import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma';

/**
 * Search quality event types
 */
export enum SearchEventType {
  SEARCH = 'search',
  CLICK = 'click',
  ADD_TO_CART = 'add_to_cart',
  PURCHASE = 'purchase',
  DWELL_TIME = 'dwell_time',
  NO_RESULTS = 'no_results',
  REFINEMENT = 'refinement',
}

/**
 * Search quality event
 */
export interface SearchQualityEvent {
  queryId: string;
  eventType: SearchEventType;
  query: string;
  userId?: string;
  sessionId?: string;
  productId?: string;
  position?: number;
  dwellTimeMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated search quality metrics
 */
export interface SearchQualityMetrics {
  period: { start: Date; end: Date };
  totalSearches: number;
  uniqueQueries: number;
  zeroResultRate: number;
  clickThroughRate: number;
  conversionRate: number;
  meanReciprocalRank: number;
  averageClickPosition: number;
  refinementRate: number;
  averageDwellTimeMs: number;
  topQueries: Array<{ query: string; count: number }>;
  topNoResultQueries: Array<{ query: string; count: number }>;
}

/**
 * Query-level metrics
 */
export interface QueryLevelMetrics {
  queryId: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  clicked: boolean;
  clickPosition?: number;
  converted: boolean;
  refined: boolean;
  dwellTimeMs?: number;
}

/**
 * Service for tracking and analyzing search quality metrics
 */
@Injectable()
export class SearchQualityService {
  private readonly logger = new Logger(SearchQualityService.name);
  private eventBuffer: SearchQualityEvent[] = [];
  private readonly bufferSize = 100;
  private readonly flushIntervalMs = 30000; // 30 seconds
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(private readonly prisma: PrismaService) {
    this.startFlushInterval();
  }

  onModuleDestroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }

  /**
   * Track a search event
   */
  trackSearch(event: {
    queryId: string;
    query: string;
    resultCount: number;
    userId?: string;
    sessionId?: string;
    latencyMs?: number;
    expansionUsed?: boolean;
    rerankingApplied?: boolean;
  }): void {
    this.addEvent({
      queryId: event.queryId,
      eventType: event.resultCount > 0 ? SearchEventType.SEARCH : SearchEventType.NO_RESULTS,
      query: event.query,
      userId: event.userId,
      sessionId: event.sessionId,
      metadata: {
        resultCount: event.resultCount,
        latencyMs: event.latencyMs,
        expansionUsed: event.expansionUsed,
        rerankingApplied: event.rerankingApplied,
      },
    });
  }

  /**
   * Track a click on search result
   */
  trackClick(event: {
    queryId: string;
    query: string;
    productId: string;
    position: number;
    userId?: string;
    sessionId?: string;
  }): void {
    this.addEvent({
      queryId: event.queryId,
      eventType: SearchEventType.CLICK,
      query: event.query,
      productId: event.productId,
      position: event.position,
      userId: event.userId,
      sessionId: event.sessionId,
    });
  }

  /**
   * Track add to cart from search results
   */
  trackAddToCart(event: {
    queryId: string;
    query: string;
    productId: string;
    position: number;
    userId?: string;
    sessionId?: string;
  }): void {
    this.addEvent({
      queryId: event.queryId,
      eventType: SearchEventType.ADD_TO_CART,
      query: event.query,
      productId: event.productId,
      position: event.position,
      userId: event.userId,
      sessionId: event.sessionId,
    });
  }

  /**
   * Track purchase from search results
   */
  trackPurchase(event: {
    queryId: string;
    query: string;
    productId: string;
    position: number;
    userId?: string;
    sessionId?: string;
  }): void {
    this.addEvent({
      queryId: event.queryId,
      eventType: SearchEventType.PURCHASE,
      query: event.query,
      productId: event.productId,
      position: event.position,
      userId: event.userId,
      sessionId: event.sessionId,
    });
  }

  /**
   * Track dwell time on product page from search
   */
  trackDwellTime(event: {
    queryId: string;
    query: string;
    productId: string;
    dwellTimeMs: number;
    userId?: string;
    sessionId?: string;
  }): void {
    this.addEvent({
      queryId: event.queryId,
      eventType: SearchEventType.DWELL_TIME,
      query: event.query,
      productId: event.productId,
      dwellTimeMs: event.dwellTimeMs,
      userId: event.userId,
      sessionId: event.sessionId,
    });
  }

  /**
   * Track search refinement (user modifies query)
   */
  trackRefinement(event: {
    originalQueryId: string;
    newQueryId: string;
    originalQuery: string;
    newQuery: string;
    userId?: string;
    sessionId?: string;
  }): void {
    this.addEvent({
      queryId: event.newQueryId,
      eventType: SearchEventType.REFINEMENT,
      query: event.newQuery,
      userId: event.userId,
      sessionId: event.sessionId,
      metadata: {
        originalQueryId: event.originalQueryId,
        originalQuery: event.originalQuery,
      },
    });
  }

  /**
   * Get aggregated search quality metrics
   */
  async getMetrics(startDate: Date, endDate: Date): Promise<SearchQualityMetrics> {
    // Flush pending events first
    await this.flush();

    try {
      // Get total searches
      const totalSearches = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'search'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get unique queries
      const uniqueQueries = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT query) as count
        FROM search_quality_events
        WHERE event_type = 'search'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get zero result count
      const zeroResults = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'no_results'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get click count
      const clicks = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'click'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get conversion count
      const conversions = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'purchase'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get average click position
      const avgPosition = await this.prisma.$queryRaw<[{ avg: number | null }]>`
        SELECT AVG(position::float) as avg
        FROM search_quality_events
        WHERE event_type = 'click'
        AND position IS NOT NULL
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get refinement count
      const refinements = await this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'refinement'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get average dwell time
      const avgDwell = await this.prisma.$queryRaw<[{ avg: number | null }]>`
        SELECT AVG(dwell_time_ms::float) as avg
        FROM search_quality_events
        WHERE event_type = 'dwell_time'
        AND dwell_time_ms IS NOT NULL
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Calculate MRR (Mean Reciprocal Rank)
      const mrr = await this.prisma.$queryRaw<[{ mrr: number | null }]>`
        SELECT AVG(1.0 / position::float) as mrr
        FROM search_quality_events
        WHERE event_type = 'click'
        AND position IS NOT NULL
        AND position > 0
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      `;

      // Get top queries
      const topQueries = await this.prisma.$queryRaw<Array<{ query: string; count: bigint }>>`
        SELECT query, COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'search'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `;

      // Get top no-result queries
      const topNoResultQueries = await this.prisma.$queryRaw<Array<{ query: string; count: bigint }>>`
        SELECT query, COUNT(*) as count
        FROM search_quality_events
        WHERE event_type = 'no_results'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
        GROUP BY query
        ORDER BY count DESC
        LIMIT 10
      `;

      const total = Number(totalSearches[0]?.count || 0);
      const totalWithZero = total + Number(zeroResults[0]?.count || 0);
      const clickCount = Number(clicks[0]?.count || 0);

      return {
        period: { start: startDate, end: endDate },
        totalSearches: totalWithZero,
        uniqueQueries: Number(uniqueQueries[0]?.count || 0),
        zeroResultRate: totalWithZero > 0 ? Number(zeroResults[0]?.count || 0) / totalWithZero : 0,
        clickThroughRate: total > 0 ? clickCount / total : 0,
        conversionRate: clickCount > 0 ? Number(conversions[0]?.count || 0) / clickCount : 0,
        meanReciprocalRank: mrr[0]?.mrr || 0,
        averageClickPosition: avgPosition[0]?.avg || 0,
        refinementRate: total > 0 ? Number(refinements[0]?.count || 0) / total : 0,
        averageDwellTimeMs: avgDwell[0]?.avg || 0,
        topQueries: topQueries.map(q => ({ query: q.query, count: Number(q.count) })),
        topNoResultQueries: topNoResultQueries.map(q => ({ query: q.query, count: Number(q.count) })),
      };
    } catch (error) {
      this.logger.error(`Failed to get search quality metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get precision and recall estimates based on user feedback
   */
  async getPrecisionRecall(startDate: Date, endDate: Date): Promise<{
    estimatedPrecision: number;
    estimatedRecall: number;
    ndcg: number;
    sampleSize: number;
  }> {
    try {
      // Estimate precision based on click rate at different positions
      // Higher click rates at top positions indicate better precision
      const positionClicks = await this.prisma.$queryRaw<
        Array<{ position: number; clicks: bigint; total: bigint }>
      >`
        WITH searches AS (
          SELECT query_id, COUNT(*) as total
          FROM search_quality_events
          WHERE event_type = 'search'
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
          GROUP BY query_id
        ),
        clicks AS (
          SELECT query_id, position
          FROM search_quality_events
          WHERE event_type = 'click'
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        )
        SELECT
          c.position,
          COUNT(c.query_id) as clicks,
          (SELECT COUNT(*) FROM searches) as total
        FROM clicks c
        WHERE c.position <= 10
        GROUP BY c.position
        ORDER BY c.position
      `;

      // Calculate NDCG (Normalized Discounted Cumulative Gain)
      let dcg = 0;
      let idealDcg = 0;
      const totalSearches = Number(positionClicks[0]?.total || 0);

      for (let i = 0; i < 10; i++) {
        const posData = positionClicks.find(p => p.position === i + 1);
        const clickRate = posData ? Number(posData.clicks) / (totalSearches || 1) : 0;

        // DCG = Σ rel_i / log2(i + 1)
        dcg += clickRate / Math.log2(i + 2);

        // Ideal DCG assumes perfect ordering (1 for all positions)
        idealDcg += 1 / Math.log2(i + 2);
      }

      const ndcg = idealDcg > 0 ? dcg / idealDcg : 0;

      // Estimate precision as click-through rate for top 3 results
      const top3Clicks = positionClicks
        .filter(p => p.position <= 3)
        .reduce((sum, p) => sum + Number(p.clicks), 0);
      const estimatedPrecision = totalSearches > 0 ? top3Clicks / (totalSearches * 3) : 0;

      // Estimate recall as ratio of clicked items to expected relevant items
      const totalClicks = positionClicks.reduce((sum, p) => sum + Number(p.clicks), 0);
      const expectedRelevant = totalSearches * 5; // Assume 5 relevant items per query
      const estimatedRecall = expectedRelevant > 0 ? totalClicks / expectedRelevant : 0;

      return {
        estimatedPrecision: Math.min(estimatedPrecision, 1),
        estimatedRecall: Math.min(estimatedRecall, 1),
        ndcg,
        sampleSize: totalSearches,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate precision/recall: ${error.message}`);
      return {
        estimatedPrecision: 0,
        estimatedRecall: 0,
        ndcg: 0,
        sampleSize: 0,
      };
    }
  }

  /**
   * Add event to buffer
   */
  private addEvent(event: SearchQualityEvent): void {
    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Flush buffered events to database
   */
  async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      for (const event of events) {
        await this.prisma.$executeRaw`
          INSERT INTO search_quality_events (
            query_id,
            event_type,
            query,
            user_id,
            session_id,
            product_id,
            position,
            dwell_time_ms,
            metadata,
            created_at
          ) VALUES (
            ${event.queryId},
            ${event.eventType},
            ${event.query},
            ${event.userId || null},
            ${event.sessionId || null},
            ${event.productId || null},
            ${event.position || null},
            ${event.dwellTimeMs || null},
            ${event.metadata ? JSON.stringify(event.metadata) : null}::jsonb,
            NOW()
          )
        `;
      }

      this.logger.debug(`Flushed ${events.length} search quality events`);
    } catch (error) {
      this.logger.error(`Failed to flush search quality events: ${error.message}`);
      // Re-add events to buffer on failure
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Start periodic flush interval
   */
  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }
}
