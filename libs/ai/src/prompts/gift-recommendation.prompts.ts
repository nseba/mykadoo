/**
 * Gift Recommendation Prompt Templates
 *
 * Carefully crafted prompts for generating personalized gift recommendations
 */

import { PromptContext, PromptTemplate } from '../types';

export class GiftRecommendationPrompts {
  /**
   * Generate a system prompt for the AI to understand its role
   */
  static getSystemPrompt(): string {
    return `You are an expert gift recommendation assistant with deep knowledge of consumer products, gifting etiquette, and personalization. Your goal is to suggest thoughtful, appropriate gifts that match the recipient's interests, age, and the occasion.

Key Principles:
1. Consider the recipient's interests and hobbies when suggesting gifts
2. Respect budget constraints strictly
3. Ensure gifts are age-appropriate and occasion-appropriate
4. Provide diverse suggestions across different categories
5. Explain why each gift matches the recipient's profile
6. Be specific about product names and descriptions

Output Format:
Return a JSON array of gift recommendations. Each recommendation must include:
- productName: Specific product name
- description: 2-3 sentences about the product
- price: Estimated price in USD (must be within budget)
- category: Product category (e.g., Electronics, Books, Fashion, Home & Garden)
- tags: Array of relevant tags
- matchReason: 2-3 sentences explaining why this gift matches the recipient

Ensure all prices are within the specified budget range.`;
  }

  /**
   * Generate a user prompt with search context
   */
  static getUserPrompt(context: PromptContext): string {
    const {
      occasion,
      relationship,
      ageRange,
      gender,
      budgetMin,
      budgetMax,
      interests,
      previousRecommendations,
    } = context;

    let prompt = `I'm looking for gift ideas for the following person:

**Occasion:** ${occasion}
**Relationship:** ${relationship}
**Age Range:** ${ageRange}`;

    if (gender) {
      prompt += `\n**Gender:** ${gender}`;
    }

    prompt += `\n**Budget:** $${budgetMin} - $${budgetMax}
**Interests:** ${interests.join(', ')}`;

    if (previousRecommendations && previousRecommendations.length > 0) {
      prompt += `\n\n**Note:** Avoid suggesting these products as they were previously recommended: ${previousRecommendations.join(', ')}`;
    }

    prompt += `\n\nPlease suggest 10 unique and thoughtful gift ideas that would be perfect for this person. Ensure all suggestions are within the budget range and match their interests.

Return the results as a JSON array with the following structure:
[
  {
    "productName": "string",
    "description": "string",
    "price": number,
    "category": "string",
    "tags": ["string"],
    "matchReason": "string"
  }
]`;

    return prompt;
  }

  /**
   * Generate a complete prompt template
   */
  static getPromptTemplate(context: PromptContext): PromptTemplate {
    return {
      system: this.getSystemPrompt(),
      user: this.getUserPrompt(context),
      examples: [
        {
          input: `Occasion: Birthday
Relationship: Friend
Age Range: Young Adult (18-30)
Gender: Female
Budget: $30 - $60
Interests: Reading, Coffee, Yoga`,
          output: `[
  {
    "productName": "Personalized Book Embosser",
    "description": "A custom book embosser with their name that creates an elegant embossed stamp on book pages. Perfect for book lovers who want to personalize their library.",
    "price": 35,
    "category": "Books & Stationery",
    "tags": ["reading", "personalized", "unique"],
    "matchReason": "Since they love reading, this personalized embosser adds a special touch to their book collection and shows thoughtfulness."
  },
  {
    "productName": "Premium Yoga Mat with Carrying Strap",
    "description": "Eco-friendly non-slip yoga mat (6mm thick) with alignment marks and a convenient carrying strap. Made from sustainable materials.",
    "price": 48,
    "category": "Sports & Fitness",
    "tags": ["yoga", "fitness", "eco-friendly"],
    "matchReason": "Perfect for their yoga practice, this high-quality mat provides excellent grip and comfort for all types of yoga sessions."
  },
  {
    "productName": "Coffee Subscription - 3 Month",
    "description": "A 3-month subscription to artisanal coffee from around the world. Includes tasting notes and brewing tips. Delivers fresh beans monthly.",
    "price": 55,
    "category": "Food & Beverages",
    "tags": ["coffee", "subscription", "gourmet"],
    "matchReason": "As a coffee enthusiast, they'll enjoy discovering new coffee varieties and expanding their palate with this curated subscription."
  }
]`,
        },
      ],
    };
  }

  /**
   * Generate a refinement prompt based on user feedback
   */
  static getRefinementPrompt(
    originalContext: PromptContext,
    rejectedItems: string[],
    feedback: string
  ): string {
    return `Based on the previous recommendations, the user provided this feedback: "${feedback}"

They were not interested in: ${rejectedItems.join(', ')}

Please provide 5 NEW gift recommendations that address their feedback and avoid similar items. Use the same JSON format as before.`;
  }

  /**
   * Generate a prompt for explaining why a specific product was recommended
   */
  static getExplanationPrompt(productName: string, context: PromptContext): string {
    return `Explain in 2-3 sentences why "${productName}" is a great gift for someone who:
- Occasion: ${context.occasion}
- Relationship: ${context.relationship}
- Age: ${context.ageRange}
- Interests: ${context.interests.join(', ')}

Focus on how the gift matches their interests and is appropriate for the occasion.`;
  }

  /**
   * Generate a prompt for budget-conscious recommendations
   */
  static getBudgetOptimizedPrompt(context: PromptContext): string {
    const midpoint = (context.budgetMin + context.budgetMax) / 2;

    return `${this.getUserPrompt(context)}

**Special Focus:** Please prioritize gifts around the $${midpoint} price point that offer excellent value for money. Include a mix of practical and thoughtful options.`;
  }

  /**
   * Generate a prompt for unique/creative recommendations
   */
  static getCreativePrompt(context: PromptContext): string {
    return `${this.getUserPrompt(context)}

**Special Focus:** Please suggest unique and creative gifts that go beyond typical recommendations. Think outside the box while still matching their interests.`;
  }
}

/**
 * Prompt for product description enhancement
 */
export function enhanceProductDescriptionPrompt(
  productName: string,
  basicDescription: string
): string {
  return `Enhance this product description to make it more appealing and informative:

Product: ${productName}
Current Description: ${basicDescription}

Provide a 2-3 sentence enhanced description that highlights key features and benefits. Keep it concise and engaging.`;
}

/**
 * Prompt for category classification
 */
export function categorizationPrompt(productName: string, description: string): string {
  return `Categorize this product into one of these categories:
- Electronics & Gadgets
- Books & Media
- Fashion & Accessories
- Home & Garden
- Sports & Outdoors
- Arts & Crafts
- Food & Beverages
- Health & Beauty
- Toys & Games
- Jewelry & Watches
- Other

Product: ${productName}
Description: ${description}

Return only the category name.`;
}
