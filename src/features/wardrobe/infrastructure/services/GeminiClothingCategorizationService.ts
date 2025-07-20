import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { config } from '../../../../core/config/environment';
import {
  IClothingCategorizationService,
  CategorizationInput,
  CategorizationResult,
  CategoryAlternative,
  ItemAttribute,
  CategoryRules,
  ValidationResult,
  SimilarItem,
  CategorizationFeedback,
  AccuracyMetrics,
  CategorizationError,
  InsufficientDataError,
  UnsupportedCategoryError,
} from '../../domain/services';
import { ClothingCategory, Season, Occasion } from '../../domain/entities';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

interface GeminiCategorizationResult {
  category: string;
  subcategory: string;
  confidence: number;
  alternatives: {
    category: string;
    subcategory: string;
    confidence: number;
    reason: string;
  }[];
  suggestedSeasons: string[];
  suggestedOccasions: string[];
  tags: string[];
  attributes: {
    name: string;
    value: string;
    confidence: number;
  }[];
}

export class GeminiClothingCategorizationService implements IClothingCategorizationService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly model: string;

  constructor() {
    this.apiKey = config.gemini.apiKey || '';
    this.model = config.gemini.model || 'gemini-1.5-pro-latest';
    
    if (!this.apiKey) {
      throw new Error('Gemini API key is required');
    }
  }

  async categorizeItem(input: CategorizationInput): Promise<Result<CategorizationResult>> {
    try {
      // Validate input
      const validationResult = this.validateInput(input);
      if (!validationResult.succeeded) {
        return Result.fail<CategorizationResult>(validationResult.message);
      }

      // Build prompt for categorization
      const prompt = this.buildCategorizationPrompt(input);

      // Call Gemini API
      let geminiResult: Result<string>;
      
      if (input.imageUrl) {
        geminiResult = await this.callGeminiVisionAPI(input.imageUrl, prompt);
      } else {
        geminiResult = await this.callGeminiTextAPI(prompt);
      }

      if (!geminiResult.succeeded) {
        return Result.fail<CategorizationResult>(geminiResult.message);
      }

      // Parse response
      const parseResult = this.parseGeminiResponse(geminiResult.value);
      if (!parseResult.succeeded) {
        return Result.fail<CategorizationResult>(parseResult.message);
      }

      // Convert to domain model
      const result = this.convertToDomainModel(parseResult.value);
      return Result.ok<CategorizationResult>(result);

    } catch (error) {
      return Result.fail<CategorizationResult>(
        `Categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async categorizeItems(inputs: CategorizationInput[]): Promise<Result<CategorizationResult[]>> {
    try {
      const results: CategorizationResult[] = [];
      const errors: string[] = [];

      for (const input of inputs) {
        const result = await this.categorizeItem(input);
        if (result.succeeded) {
          results.push(result.value);
        } else {
          errors.push(`Failed to categorize item: ${result.message}`);
        }
      }

      if (results.length === 0 && errors.length > 0) {
        return Result.fail<CategorizationResult[]>(`All categorizations failed: ${errors.join(', ')}`);
      }

      return Result.ok<CategorizationResult[]>(results);
    } catch (error) {
      return Result.fail<CategorizationResult[]>(
        `Batch categorization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getCategorySuggestionsFromImage(imageUrl: string): Promise<Result<CategorizationResult>> {
    return this.categorizeItem({ imageUrl });
  }

  async getCategorySuggestionsFromText(text: string): Promise<Result<CategorizationResult>> {
    return this.categorizeItem({ name: text });
  }

  async validateCategorization(
    category: ClothingCategory,
    subcategory: string,
    input: CategorizationInput
  ): Promise<Result<ValidationResult>> {
    try {
      // Get AI suggestion for comparison
      const aiResult = await this.categorizeItem(input);
      
      if (!aiResult.succeeded) {
        return Result.ok<ValidationResult>({
          isValid: true,
          confidence: 0.5,
          warnings: ['Could not validate against AI suggestion'],
          suggestions: [],
        });
      }

      const aiCategory = aiResult.value.category;
      const aiSubcategory = aiResult.value.subcategory;

      const isValid = category === aiCategory;
      const confidence = aiResult.value.confidence;
      const warnings: string[] = [];
      const suggestions: string[] = [];

      if (!isValid) {
        warnings.push(`AI suggests category: ${aiCategory} instead of ${category}`);
        suggestions.push(`Consider using category: ${aiCategory}`);
      }

      if (subcategory !== aiSubcategory) {
        warnings.push(`AI suggests subcategory: ${aiSubcategory} instead of ${subcategory}`);
        suggestions.push(`Consider using subcategory: ${aiSubcategory}`);
      }

      const validationResult: ValidationResult = {
        isValid,
        confidence,
        warnings,
        suggestions,
      };

      return Result.ok<ValidationResult>(validationResult);
    } catch (error) {
      return Result.fail<ValidationResult>(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getSimilarItems(
    category: ClothingCategory,
    subcategory: string,
    attributes: ItemAttribute[]
  ): Promise<Result<SimilarItem[]>> {
    // This would typically query a database of similar items
    // For now, return empty array
    return Result.ok<SimilarItem[]>([]);
  }

  async getCategoryRules(category: ClothingCategory): Promise<Result<CategoryRules>> {
    try {
      // Return predefined rules for each category
      const rules = this.getPredefinedRules(category);
      return Result.ok<CategoryRules>(rules);
    } catch (error) {
      return Result.fail<CategoryRules>(
        `Failed to get category rules: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async updateCategoryRules(category: ClothingCategory, rules: CategoryRules): Promise<Result<void>> {
    // This would typically update stored rules
    // For now, just validate the input
    if (!rules.keywords || rules.keywords.length === 0) {
      return Result.fail<void>('Keywords are required for category rules');
    }

    return Result.ok<void>();
  }

  async getSubcategories(category: ClothingCategory): Promise<Result<string[]>> {
    try {
      const subcategories = this.getPredefinedSubcategories(category);
      return Result.ok<string[]>(subcategories);
    } catch (error) {
      return Result.fail<string[]>(
        `Failed to get subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async trainModel(feedback: CategorizationFeedback[]): Promise<Result<void>> {
    // This would typically send feedback to improve the model
    // For now, just log the feedback
    console.log(`Received ${feedback.length} feedback items for model training`);
    return Result.ok<void>();
  }

  async getAccuracyMetrics(): Promise<Result<AccuracyMetrics>> {
    // This would typically return real metrics
    // For now, return mock data
    const metrics: AccuracyMetrics = {
      overallAccuracy: 0.85,
      categoryAccuracy: {
        [ClothingCategory.TOPS]: 0.9,
        [ClothingCategory.BOTTOMS]: 0.88,
        [ClothingCategory.OUTERWEAR]: 0.82,
        [ClothingCategory.DRESSES]: 0.85,
        [ClothingCategory.SHOES]: 0.87,
        [ClothingCategory.ACCESSORIES]: 0.8,
        [ClothingCategory.UNDERWEAR]: 0.9,
        [ClothingCategory.ACTIVEWEAR]: 0.86,
        [ClothingCategory.FORMAL]: 0.83,
        [ClothingCategory.SLEEPWEAR]: 0.89,
      },
      confidence: 0.85,
      totalPredictions: 1000,
      correctPredictions: 850,
      lastUpdated: new Date(),
    };

    return Result.ok<AccuracyMetrics>(metrics);
  }

  private validateInput(input: CategorizationInput): Result<void> {
    if (!input.imageUrl && !input.name && !input.description) {
      return Result.fail<void>('At least one of imageUrl, name, or description is required');
    }

    if (input.imageUrl) {
      try {
        new URL(input.imageUrl);
      } catch {
        return Result.fail<void>('Invalid image URL format');
      }
    }

    return Result.ok<void>();
  }

  private buildCategorizationPrompt(input: CategorizationInput): string {
    const prompt = `
Analyze this clothing item and categorize it. Provide a comprehensive categorization in JSON format.

Item Information:
${input.name ? `Name: ${input.name}` : ''}
${input.description ? `Description: ${input.description}` : ''}
${input.brand ? `Brand: ${input.brand}` : ''}
${input.existingTags ? `Existing Tags: ${input.existingTags.join(', ')}` : ''}

User Hints:
${input.userHints?.preferredCategory ? `Preferred Category: ${input.userHints.preferredCategory}` : ''}
${input.userHints?.preferredSeasons ? `Preferred Seasons: ${input.userHints.preferredSeasons.join(', ')}` : ''}
${input.userHints?.preferredOccasions ? `Preferred Occasions: ${input.userHints.preferredOccasions.join(', ')}` : ''}

Available Categories:
- tops: T-shirts, blouses, sweaters, shirts, tank tops, hoodies
- bottoms: Jeans, trousers, skirts, shorts, leggings, pants
- outerwear: Jackets, coats, blazers, cardigans, vests
- dresses: All types of dresses and jumpsuits
- shoes: Sneakers, boots, sandals, heels, flats, loafers
- accessories: Bags, jewelry, belts, scarves, hats, watches
- underwear: Bras, panties, underwear, socks, tights
- activewear: Gym clothes, sportswear, athletic gear
- formal: Formal wear, evening wear, suits, formal dresses
- sleepwear: Pajamas, nightgowns, robes, loungewear

Return the analysis as a valid JSON object:
{
  "category": "category_name",
  "subcategory": "specific_subcategory",
  "confidence": 0.9,
  "alternatives": [
    {
      "category": "alternative_category",
      "subcategory": "alternative_subcategory", 
      "confidence": 0.7,
      "reason": "Why this could be an alternative"
    }
  ],
  "suggestedSeasons": ["spring", "summer", "fall", "winter", "all_seasons"],
  "suggestedOccasions": ["casual", "work", "formal", "party", "sports", "vacation", "date", "outdoor", "loungewear"],
  "tags": ["comfortable", "professional", "trendy"],
  "attributes": [
    {
      "name": "sleeve_length",
      "value": "short",
      "confidence": 0.9
    }
  ]
}

Ensure the response is valid JSON only, no additional text.
`;

    return prompt;
  }

  private async callGeminiVisionAPI(imageUrl: string, prompt: string): Promise<Result<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: await this.getImageAsBase64(imageUrl),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No categorization results from Gemini API');
      }

      const text = data.candidates[0].content.parts[0].text;
      return Result.ok<string>(text);
    } catch (error) {
      return Result.fail<string>(
        `Gemini Vision API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async callGeminiTextAPI(prompt: string): Promise<Result<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No categorization results from Gemini API');
      }

      const text = data.candidates[0].content.parts[0].text;
      return Result.ok<string>(text);
    } catch (error) {
      return Result.fail<string>(
        `Gemini Text API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return base64;
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseGeminiResponse(responseText: string): Result<GeminiCategorizationResult> {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonText = jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      // Validate required fields
      const required = ['category', 'subcategory', 'confidence'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return Result.ok<GeminiCategorizationResult>(parsed);
    } catch (error) {
      return Result.fail<GeminiCategorizationResult>(
        `Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private convertToDomainModel(geminiResult: GeminiCategorizationResult): CategorizationResult {
    return {
      category: this.mapToClothingCategory(geminiResult.category),
      subcategory: geminiResult.subcategory,
      confidence: geminiResult.confidence,
      alternatives: geminiResult.alternatives?.map(alt => ({
        category: this.mapToClothingCategory(alt.category),
        subcategory: alt.subcategory,
        confidence: alt.confidence,
        reason: alt.reason,
      })) || [],
      suggestedSeasons: geminiResult.suggestedSeasons?.map(s => this.mapToSeason(s)) || [],
      suggestedOccasions: geminiResult.suggestedOccasions?.map(o => this.mapToOccasion(o)) || [],
      tags: geminiResult.tags || [],
      attributes: geminiResult.attributes?.map(attr => ({
        name: attr.name,
        value: attr.value,
        confidence: attr.confidence,
      })) || [],
    };
  }

  private mapToClothingCategory(value: string): ClothingCategory {
    const mapping: Record<string, ClothingCategory> = {
      tops: ClothingCategory.TOPS,
      bottoms: ClothingCategory.BOTTOMS,
      outerwear: ClothingCategory.OUTERWEAR,
      dresses: ClothingCategory.DRESSES,
      shoes: ClothingCategory.SHOES,
      accessories: ClothingCategory.ACCESSORIES,
      underwear: ClothingCategory.UNDERWEAR,
      activewear: ClothingCategory.ACTIVEWEAR,
      formal: ClothingCategory.FORMAL,
      sleepwear: ClothingCategory.SLEEPWEAR,
    };
    return mapping[value?.toLowerCase()] || ClothingCategory.TOPS;
  }

  private mapToSeason(value: string): Season {
    const mapping: Record<string, Season> = {
      spring: Season.SPRING,
      summer: Season.SUMMER,
      fall: Season.FALL,
      winter: Season.WINTER,
      all_seasons: Season.ALL_SEASONS,
    };
    return mapping[value?.toLowerCase()] || Season.ALL_SEASONS;
  }

  private mapToOccasion(value: string): Occasion {
    const mapping: Record<string, Occasion> = {
      casual: Occasion.CASUAL,
      work: Occasion.WORK,
      formal: Occasion.FORMAL,
      party: Occasion.PARTY,
      sports: Occasion.SPORTS,
      vacation: Occasion.VACATION,
      date: Occasion.DATE,
      outdoor: Occasion.OUTDOOR,
      loungewear: Occasion.LOUNGEWEAR,
    };
    return mapping[value?.toLowerCase()] || Occasion.CASUAL;
  }

  private getPredefinedRules(category: ClothingCategory): CategoryRules {
    // This would typically come from a database or configuration
    const commonRules: CategoryRules = {
      category,
      keywords: [],
      visualCues: [],
      seasonalRelevance: {
        [Season.SPRING]: 0.8,
        [Season.SUMMER]: 0.8,
        [Season.FALL]: 0.8,
        [Season.WINTER]: 0.8,
        [Season.ALL_SEASONS]: 1.0,
      },
      occasionalRelevance: {
        [Occasion.CASUAL]: 0.9,
        [Occasion.WORK]: 0.7,
        [Occasion.FORMAL]: 0.5,
        [Occasion.PARTY]: 0.6,
        [Occasion.SPORTS]: 0.3,
        [Occasion.VACATION]: 0.8,
        [Occasion.DATE]: 0.7,
        [Occasion.OUTDOOR]: 0.6,
        [Occasion.LOUNGEWEAR]: 0.8,
      },
      commonSubcategories: [],
    };

    switch (category) {
      case ClothingCategory.TOPS:
        return {
          ...commonRules,
          keywords: ['shirt', 'blouse', 'sweater', 'top', 'tank', 'hoodie'],
          visualCues: ['upper body', 'sleeves', 'collar', 'neckline'],
          commonSubcategories: ['T-Shirt', 'Blouse', 'Sweater', 'Tank Top', 'Hoodie', 'Shirt'],
        };
      case ClothingCategory.BOTTOMS:
        return {
          ...commonRules,
          keywords: ['jeans', 'pants', 'trousers', 'shorts', 'skirt', 'leggings'],
          visualCues: ['lower body', 'legs', 'waistband', 'hem'],
          commonSubcategories: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings'],
        };
      // Add more categories as needed
      default:
        return commonRules;
    }
  }

  private getPredefinedSubcategories(category: ClothingCategory): string[] {
    switch (category) {
      case ClothingCategory.TOPS:
        return ['T-Shirt', 'Blouse', 'Sweater', 'Tank Top', 'Hoodie', 'Shirt', 'Cardigan'];
      case ClothingCategory.BOTTOMS:
        return ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Sweatpants'];
      case ClothingCategory.OUTERWEAR:
        return ['Jacket', 'Coat', 'Blazer', 'Vest', 'Cardigan', 'Windbreaker'];
      case ClothingCategory.SHOES:
        return ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers'];
      case ClothingCategory.ACCESSORIES:
        return ['Bag', 'Jewelry', 'Belt', 'Scarf', 'Hat', 'Watch', 'Sunglasses'];
      case ClothingCategory.DRESSES:
        return ['Casual Dress', 'Formal Dress', 'Maxi Dress', 'Mini Dress', 'Midi Dress'];
      default:
        return [];
    }
  }
}

export class GeminiCategorizationError extends CategorizationError {
  constructor(message: string) {
    super(message, 'GEMINI_CATEGORIZATION_ERROR');
  }
}

export class GeminiAPIError extends GeminiCategorizationError {
  constructor(message: string) {
    super(`Gemini API error: ${message}`);
  }
}