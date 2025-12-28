import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EMBEDDING_COST, EmbeddingJobType } from './embedding-pipeline.constants';
import { CostTrackingRecord } from './interfaces';

/**
 * Service for tracking embedding generation costs
 * Monitors OpenAI API usage and provides cost estimates
 */
@Injectable()
export class EmbeddingCostService {
  private readonly logger = new Logger(EmbeddingCostService.name);
  private readonly dailyCostKey = 'embedding:cost:daily';
  private readonly monthlyBudgetKey = 'embedding:budget:monthly';

  // In-memory tracking for current session
  private sessionCost = {
    tokensUsed: 0,
    estimatedCost: 0,
    jobCount: 0,
    startTime: new Date().toISOString(),
  };

  // Cost tracking history
  private costHistory: CostTrackingRecord[] = [];

  // Budget configuration
  private monthlyBudget = 100; // Default $100/month
  private dailyBudget = 10; // Default $10/day

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    this.loadCostDataFromCache();
  }

  /**
   * Calculate cost for a given number of tokens
   */
  calculateCost(tokensUsed: number): number {
    return (tokensUsed / 1_000_000) * EMBEDDING_COST.pricePerMillionTokens;
  }

  /**
   * Estimate cost for a batch of products
   */
  estimateBatchCost(productCount: number): {
    estimatedTokens: number;
    estimatedCost: number;
  } {
    const estimatedTokens = productCount * EMBEDDING_COST.avgTokensPerProduct;
    const estimatedCost = this.calculateCost(estimatedTokens);

    return { estimatedTokens, estimatedCost };
  }

  /**
   * Record cost for a job
   */
  async recordCost(record: CostTrackingRecord): Promise<void> {
    this.sessionCost.tokensUsed += record.tokensUsed;
    this.sessionCost.estimatedCost += record.estimatedCost;
    this.sessionCost.jobCount++;

    this.costHistory.push(record);
    if (this.costHistory.length > 10000) {
      this.costHistory = this.costHistory.slice(-10000);
    }

    await this.saveCostDataToCache();

    // Check budget alerts
    await this.checkBudgetAlerts();

    this.logger.debug(
      `Cost recorded: ${record.tokensUsed} tokens, $${record.estimatedCost.toFixed(6)}`
    );
  }

  /**
   * Get current session costs
   */
  getSessionCost(): {
    tokensUsed: number;
    estimatedCost: number;
    jobCount: number;
    duration: string;
  } {
    return {
      ...this.sessionCost,
      duration: this.getSessionDuration(),
    };
  }

  /**
   * Get daily cost summary
   */
  async getDailyCost(): Promise<{
    date: string;
    tokensUsed: number;
    estimatedCost: number;
    jobCount: number;
    budgetRemaining: number;
    budgetPercentUsed: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = this.costHistory.filter(
      (r) => r.date.startsWith(today)
    );

    const tokensUsed = todayRecords.reduce((sum, r) => sum + r.tokensUsed, 0);
    const estimatedCost = todayRecords.reduce((sum, r) => sum + r.estimatedCost, 0);

    return {
      date: today,
      tokensUsed,
      estimatedCost,
      jobCount: todayRecords.length,
      budgetRemaining: Math.max(0, this.dailyBudget - estimatedCost),
      budgetPercentUsed: Math.min(100, (estimatedCost / this.dailyBudget) * 100),
    };
  }

  /**
   * Get monthly cost summary
   */
  async getMonthlyCost(): Promise<{
    month: string;
    tokensUsed: number;
    estimatedCost: number;
    jobCount: number;
    budgetRemaining: number;
    budgetPercentUsed: number;
    dailyAverage: number;
  }> {
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthRecords = this.costHistory.filter(
      (r) => r.date.startsWith(thisMonth)
    );

    const tokensUsed = monthRecords.reduce((sum, r) => sum + r.tokensUsed, 0);
    const estimatedCost = monthRecords.reduce((sum, r) => sum + r.estimatedCost, 0);

    // Calculate daily average
    const uniqueDays = new Set(
      monthRecords.map((r) => r.date.split('T')[0])
    ).size;
    const dailyAverage = uniqueDays > 0 ? estimatedCost / uniqueDays : 0;

    return {
      month: thisMonth,
      tokensUsed,
      estimatedCost,
      jobCount: monthRecords.length,
      budgetRemaining: Math.max(0, this.monthlyBudget - estimatedCost),
      budgetPercentUsed: Math.min(100, (estimatedCost / this.monthlyBudget) * 100),
      dailyAverage,
    };
  }

  /**
   * Get cost breakdown by job type
   */
  getCostByJobType(): Record<EmbeddingJobType, { tokensUsed: number; cost: number; count: number }> {
    const breakdown: Record<EmbeddingJobType, { tokensUsed: number; cost: number; count: number }> = {
      [EmbeddingJobType.GENERATE_PRODUCT_EMBEDDING]: { tokensUsed: 0, cost: 0, count: 0 },
      [EmbeddingJobType.GENERATE_BATCH_EMBEDDINGS]: { tokensUsed: 0, cost: 0, count: 0 },
      [EmbeddingJobType.BACKFILL_EMBEDDINGS]: { tokensUsed: 0, cost: 0, count: 0 },
      [EmbeddingJobType.UPDATE_PRODUCT_EMBEDDING]: { tokensUsed: 0, cost: 0, count: 0 },
      [EmbeddingJobType.VALIDATE_EMBEDDINGS]: { tokensUsed: 0, cost: 0, count: 0 },
    };

    for (const record of this.costHistory) {
      if (breakdown[record.jobType]) {
        breakdown[record.jobType].tokensUsed += record.tokensUsed;
        breakdown[record.jobType].cost += record.estimatedCost;
        breakdown[record.jobType].count++;
      }
    }

    return breakdown;
  }

  /**
   * Set budget limits
   */
  async setBudgets(daily: number, monthly: number): Promise<void> {
    this.dailyBudget = daily;
    this.monthlyBudget = monthly;
    await this.cacheManager.set(
      this.monthlyBudgetKey,
      { daily, monthly },
      86400 * 365 // 1 year
    );
    this.logger.log(`Budgets updated: daily=$${daily}, monthly=$${monthly}`);
  }

  /**
   * Check if within budget
   */
  async isWithinBudget(): Promise<{
    withinDailyBudget: boolean;
    withinMonthlyBudget: boolean;
    dailyCost: number;
    monthlyCost: number;
  }> {
    const daily = await this.getDailyCost();
    const monthly = await this.getMonthlyCost();

    return {
      withinDailyBudget: daily.estimatedCost < this.dailyBudget,
      withinMonthlyBudget: monthly.estimatedCost < this.monthlyBudget,
      dailyCost: daily.estimatedCost,
      monthlyCost: monthly.estimatedCost,
    };
  }

  /**
   * Get cost projection for remaining month
   */
  async getMonthlyProjection(): Promise<{
    currentCost: number;
    projectedCost: number;
    daysRemaining: number;
    willExceedBudget: boolean;
    recommendedDailyLimit: number;
  }> {
    const monthly = await this.getMonthlyCost();
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const daysPassed = today.getDate();
    const daysRemaining = daysInMonth - daysPassed;

    const projectedCost =
      monthly.dailyAverage > 0
        ? monthly.estimatedCost + monthly.dailyAverage * daysRemaining
        : monthly.estimatedCost;

    const willExceedBudget = projectedCost > this.monthlyBudget;
    const budgetRemaining = this.monthlyBudget - monthly.estimatedCost;
    const recommendedDailyLimit =
      daysRemaining > 0 ? budgetRemaining / daysRemaining : 0;

    return {
      currentCost: monthly.estimatedCost,
      projectedCost,
      daysRemaining,
      willExceedBudget,
      recommendedDailyLimit: Math.max(0, recommendedDailyLimit),
    };
  }

  /**
   * Check budget alerts
   */
  private async checkBudgetAlerts(): Promise<void> {
    const daily = await this.getDailyCost();
    const monthly = await this.getMonthlyCost();

    // Daily budget alerts
    if (daily.budgetPercentUsed >= 100) {
      this.logger.error(`ALERT: Daily budget exceeded! ($${daily.estimatedCost.toFixed(2)}/$${this.dailyBudget})`);
    } else if (daily.budgetPercentUsed >= 80) {
      this.logger.warn(`WARNING: Daily budget at ${daily.budgetPercentUsed.toFixed(0)}%`);
    }

    // Monthly budget alerts
    if (monthly.budgetPercentUsed >= 100) {
      this.logger.error(`ALERT: Monthly budget exceeded! ($${monthly.estimatedCost.toFixed(2)}/$${this.monthlyBudget})`);
    } else if (monthly.budgetPercentUsed >= 80) {
      this.logger.warn(`WARNING: Monthly budget at ${monthly.budgetPercentUsed.toFixed(0)}%`);
    }
  }

  /**
   * Get session duration
   */
  private getSessionDuration(): string {
    const start = new Date(this.sessionCost.startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  /**
   * Load cost data from cache
   */
  private async loadCostDataFromCache(): Promise<void> {
    try {
      const budgets = await this.cacheManager.get<{ daily: number; monthly: number }>(
        this.monthlyBudgetKey
      );
      if (budgets) {
        this.dailyBudget = budgets.daily;
        this.monthlyBudget = budgets.monthly;
      }
    } catch (error) {
      this.logger.debug('No cached budget data found');
    }
  }

  /**
   * Save cost data to cache
   */
  private async saveCostDataToCache(): Promise<void> {
    try {
      // Save session cost (for recovery)
      await this.cacheManager.set(
        this.dailyCostKey,
        {
          history: this.costHistory.slice(-1000),
          sessionCost: this.sessionCost,
        },
        86400 // 24 hours
      );
    } catch (error) {
      this.logger.error('Failed to cache cost data');
    }
  }
}
