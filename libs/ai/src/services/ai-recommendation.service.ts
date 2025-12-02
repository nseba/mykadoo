/**
 * AI Recommendation Service
 *
 * Core service for generating gift recommendations using OpenAI GPT models
 */

import OpenAI from 'openai';
import {
  GiftSearchRequest,
  GiftRecommendation,
  GiftSearchResponse,
  AIModel,
  AIServiceError,
  RateLimitError,
  PromptContext,
} from '../types';
import { GiftRecommendationPrompts } from '../prompts/gift-recommendation.prompts';
import {
  getAIConfig,
  calculateCost,
  RETRY_CONFIG,
  TIMEOUT_CONFIG,
} from '../config/ai.config';

export class AIRecommendationService {
  private openai: OpenAI;
  private config: ReturnType<typeof getAIConfig>;
  private requestCount: number = 0;
  private lastResetTime: number = Date.now();

  constructor() {
    this.config = getAIConfig();
    this.openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
      organization: this.config.openai.organization,
      baseURL: this.config.openai.baseURL,
      timeout: TIMEOUT_CONFIG.recommendation,
    });
  }

  /**
   * Generate gift recommendations based on search criteria
   */
  async generateRecommendations(
    request: GiftSearchRequest
  ): Promise<GiftSearchResponse> {
    const startTime = Date.now();

    try {
      // Check rate limiting
      this.checkRateLimit();

      // Build prompt context
      const context: PromptContext = {
        occasion: request.occasion,
        relationship: request.relationship,
        ageRange: request.ageRange,
        gender: request.gender,
        budgetMin: request.budgetMin,
        budgetMax: request.budgetMax,
        interests: request.interests,
      };

      // Get prompt template
      const promptTemplate = GiftRecommendationPrompts.getPromptTemplate(context);

      // Try primary model first, fallback to secondary if needed
      let recommendations: GiftRecommendation[] = [];
      let model: AIModel = this.config.models.primary;
      let cost = 0;

      try {
        const result = await this.callOpenAI(
          model,
          promptTemplate.system,
          promptTemplate.user
        );
        recommendations = result.recommendations;
        cost = result.cost;
      } catch (error: any) {
        console.warn(`Primary model ${model} failed, trying fallback:`, error.message);

        // Fallback to secondary model
        model = this.config.models.fallback;
        const result = await this.callOpenAI(
          model,
          promptTemplate.system,
          promptTemplate.user
        );
        recommendations = result.recommendations;
        cost = result.cost;
      }

      // Filter recommendations by budget
      recommendations = this.filterByBudget(
        recommendations,
        request.budgetMin,
        request.budgetMax
      );

      // Ensure diversity across categories
      recommendations = this.ensureDiversity(recommendations);

      // Add relevance scores
      recommendations = this.calculateRelevanceScores(recommendations, request);

      // Sort by relevance score
      recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

      const latency = Date.now() - startTime;

      return {
        recommendations,
        model,
        cost,
        latency,
        totalResults: recommendations.length,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;

      if (error.status === 429) {
        throw new RateLimitError(
          'OpenAI rate limit exceeded. Please try again later.',
          error.headers?.['retry-after']
        );
      }

      throw new AIServiceError(
        `Failed to generate recommendations: ${error.message}`,
        error.code || 'AI_ERROR',
        { latency, originalError: error }
      );
    }
  }

  /**
   * Call OpenAI API with retry logic
   */
  private async callOpenAI(
    model: AIModel,
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ recommendations: GiftRecommendation[]; cost: number }> {
    let lastError: any;

    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const completion = await this.openai.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: this.config.models.temperature,
          max_tokens: this.config.models.maxTokens,
          top_p: this.config.models.topP,
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content in OpenAI response');
        }

        // Parse JSON response
        let parsedResponse: any;
        try {
          parsedResponse = JSON.parse(content);
        } catch (parseError) {
          throw new Error(`Failed to parse OpenAI response as JSON: ${content}`);
        }

        // Extract recommendations array
        const recommendations = Array.isArray(parsedResponse)
          ? parsedResponse
          : parsedResponse.recommendations || [];

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          throw new Error('No recommendations in response');
        }

        // Calculate cost
        const inputTokens = completion.usage?.prompt_tokens || 0;
        const outputTokens = completion.usage?.completion_tokens || 0;
        const cost = calculateCost(model, inputTokens, outputTokens);

        // Transform to GiftRecommendation type
        const formattedRecommendations: GiftRecommendation[] = recommendations.map(
          (rec: any) => ({
            productName: rec.productName || rec.product_name || 'Unknown Product',
            description: rec.description || '',
            price: parseFloat(rec.price) || 0,
            currency: 'USD',
            category: rec.category || 'Other',
            tags: Array.isArray(rec.tags) ? rec.tags : [],
            matchReason: rec.matchReason || rec.match_reason || '',
            relevanceScore: 0, // Will be calculated later
          })
        );

        return {
          recommendations: formattedRecommendations,
          cost,
        };
      } catch (error: any) {
        lastError = error;

        // Check if we should retry
        if (
          attempt < RETRY_CONFIG.maxRetries - 1 &&
          RETRY_CONFIG.shouldRetry(error)
        ) {
          const delay = Math.min(
            RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.exponentialBase, attempt),
            RETRY_CONFIG.maxDelay
          );
          console.warn(`Retry attempt ${attempt + 1} after ${delay}ms`);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Filter recommendations by budget range
   */
  private filterByBudget(
    recommendations: GiftRecommendation[],
    minBudget: number,
    maxBudget: number
  ): GiftRecommendation[] {
    return recommendations.filter((rec) => {
      return rec.price >= minBudget && rec.price <= maxBudget;
    });
  }

  /**
   * Ensure diversity across categories
   */
  private ensureDiversity(recommendations: GiftRecommendation[]): GiftRecommendation[] {
    const categoryCount: Record<string, number> = {};
    const diverse: GiftRecommendation[] = [];
    const MAX_PER_CATEGORY = 3;

    for (const rec of recommendations) {
      const category = rec.category;
      const count = categoryCount[category] || 0;

      if (count < MAX_PER_CATEGORY) {
        diverse.push(rec);
        categoryCount[category] = count + 1;
      }
    }

    return diverse;
  }

  /**
   * Calculate relevance scores based on matching criteria
   */
  private calculateRelevanceScores(
    recommendations: GiftRecommendation[],
    request: GiftSearchRequest
  ): GiftRecommendation[] {
    return recommendations.map((rec) => {
      let score = 50; // Base score

      // Boost score for interest matches
      const interestMatches = request.interests.filter((interest) => {
        const interestLower = interest.toLowerCase();
        return (
          rec.description.toLowerCase().includes(interestLower) ||
          rec.tags.some((tag) => tag.toLowerCase().includes(interestLower)) ||
          rec.category.toLowerCase().includes(interestLower)
        );
      });

      score += interestMatches.length * 10;

      // Boost for price optimality (closer to middle of budget = better)
      const budgetMid = (request.budgetMin + request.budgetMax) / 2;
      const priceDiff = Math.abs(rec.price - budgetMid);
      const maxDiff = (request.budgetMax - request.budgetMin) / 2;
      const priceScore = 20 * (1 - priceDiff / maxDiff);
      score += priceScore;

      // Boost for quality indicators in description
      const qualityWords = ['premium', 'quality', 'artisan', 'handmade', 'unique'];
      const hasQualityIndicator = qualityWords.some((word) =>
        rec.description.toLowerCase().includes(word)
      );
      if (hasQualityIndicator) {
        score += 10;
      }

      // Normalize to 0-100
      return {
        ...rec,
        relevanceScore: Math.min(100, Math.max(0, score)),
      };
    });
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): void {
    if (!this.config.rateLimiting.enabled) {
      return;
    }

    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    // Reset counter every minute
    if (timeSinceReset >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if limit exceeded
    if (this.requestCount >= this.config.rateLimiting.maxRequestsPerMinute) {
      const waitTime = 60000 - timeSinceReset;
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
        Math.ceil(waitTime / 1000)
      );
    }

    this.requestCount++;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
