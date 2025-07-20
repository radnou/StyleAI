import { Result } from '../../../../core/types';
import { BaseError } from '../../../../core/errors';
import { config } from '../../../../core/config/environment';
import {
  IStyleAnalysisService,
  StyleAnalysisInput,
  StyleAnalysisError,
  ImageAnalysisError,
  InsufficientImageQualityError,
} from '../../domain/services';
import {
  StyleAnalysis,
  AnalysisResult,
  StyleSuggestion,
  StyleType,
  FormalityLevel,
  SuggestionType,
  Priority,
  ColorAnalysis,
  PatternAnalysis,
  PatternType,
  ComplexityLevel,
  ColorHarmony,
  ColorTemperature,
} from '../../domain/entities';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

interface GeminiAnalysisResult {
  dominantColors: string[];
  secondaryColors: string[];
  detectedItems: any[];
  styleType: string;
  formality: string;
  season: string[];
  occasion: string[];
  tags: string[];
  description: string;
  feedback: string;
  suggestions: any[];
  colorAnalysis: any;
  patterns: any[];
  styleScore: number;
  confidence: number;
}

export class GeminiStyleAnalysisService implements IStyleAnalysisService {
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

  async analyzeStyle(input: StyleAnalysisInput): Promise<Result<StyleAnalysis>> {
    try {
      // Validate input
      const validationResult = this.validateInput(input);
      if (!validationResult.succeeded) {
        return Result.fail<StyleAnalysis>(validationResult.message);
      }

      // Prepare the prompt for Gemini
      const prompt = this.buildAnalysisPrompt(input);

      // Call Gemini API
      const geminiResult = await this.callGeminiVisionAPI(input.imageUrl, prompt);
      if (!geminiResult.succeeded) {
        return Result.fail<StyleAnalysis>(geminiResult.message);
      }

      // Parse Gemini response
      const analysisResult = this.parseGeminiResponse(geminiResult.value);
      if (!analysisResult.succeeded) {
        return Result.fail<StyleAnalysis>(analysisResult.message);
      }

      // Create StyleAnalysis entity
      const styleAnalysisResult = await this.createStyleAnalysis(
        input,
        analysisResult.value
      );

      return styleAnalysisResult;
    } catch (error) {
      return Result.fail<StyleAnalysis>(
        `Style analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async analyzeMultipleStyles(inputs: StyleAnalysisInput[]): Promise<Result<StyleAnalysis[]>> {
    try {
      const results: StyleAnalysis[] = [];
      const errors: string[] = [];

      for (const input of inputs) {
        const result = await this.analyzeStyle(input);
        if (result.succeeded) {
          results.push(result.value);
        } else {
          errors.push(`Analysis failed for ${input.imageUrl}: ${result.message}`);
        }
      }

      if (results.length === 0 && errors.length > 0) {
        return Result.fail<StyleAnalysis[]>(`All analyses failed: ${errors.join(', ')}`);
      }

      return Result.ok<StyleAnalysis[]>(results);
    } catch (error) {
      return Result.fail<StyleAnalysis[]>(
        `Batch analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async compareStyles(
    imageUrl1: string,
    imageUrl2: string,
    context?: any
  ): Promise<Result<any>> {
    try {
      // This would be implemented to compare two styles
      // For now, return a placeholder
      const comparison = {
        similarity: 0.75,
        differences: ['Color palette differs significantly', 'Style formality levels are different'],
        improvements: ['Consider matching color temperature', 'Align formality levels'],
        score: 75,
      };

      return Result.ok<any>(comparison);
    } catch (error) {
      return Result.fail<any>(
        `Style comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Placeholder implementations for other interface methods
  async getStyleSuggestions(): Promise<Result<StyleSuggestion[]>> {
    return Result.ok<StyleSuggestion[]>([]);
  }

  async analyzeTrends(): Promise<Result<any>> {
    return Result.ok<any>({});
  }

  async getStyleEvolution(): Promise<Result<any>> {
    return Result.ok<any>({});
  }

  async getPersonalizedRecommendations(): Promise<Result<StyleSuggestion[]>> {
    return Result.ok<StyleSuggestion[]>([]);
  }

  async validateAnalysis(): Promise<Result<any>> {
    return Result.ok<any>({});
  }

  async getConfidenceScore(): Promise<Result<number>> {
    return Result.ok<number>(0.8);
  }

  async improveWithFeedback(): Promise<Result<StyleAnalysis>> {
    throw new Error('Not implemented');
  }

  async getSimilarStyles(): Promise<Result<any[]>> {
    return Result.ok<any[]>([]);
  }

  async getCompatibilityScore(): Promise<Result<number>> {
    return Result.ok<number>(0.8);
  }

  async generateStyleReport(): Promise<Result<any>> {
    return Result.ok<any>({});
  }

  private validateInput(input: StyleAnalysisInput): Result<void> {
    if (!input.imageUrl || input.imageUrl.trim().length === 0) {
      return Result.fail<void>('Image URL is required');
    }

    // Validate URL format
    try {
      new URL(input.imageUrl);
    } catch {
      return Result.fail<void>('Invalid image URL format');
    }

    return Result.ok<void>();
  }

  private buildAnalysisPrompt(input: StyleAnalysisInput): string {
    const basePrompt = `
Analyze this fashion image and provide a comprehensive style analysis in JSON format.

Please analyze the following aspects:
1. Dominant and secondary colors (hex codes)
2. Detected clothing items with categories
3. Overall style type and formality level
4. Suitable seasons and occasions
5. Fashion patterns and their complexity
6. Color harmony and temperature
7. Style suggestions and improvements
8. Overall style score (1-100)
9. Analysis confidence (0-1)

Context:
${input.context ? JSON.stringify(input.context) : 'No specific context provided'}

User Preferences:
${input.userPreferences ? JSON.stringify(input.userPreferences) : 'No specific preferences provided'}

Return the analysis as a valid JSON object with the following structure:
{
  "dominantColors": ["#color1", "#color2"],
  "secondaryColors": ["#color3", "#color4"],
  "detectedItems": [
    {
      "type": "shirt",
      "category": "tops",
      "confidence": 0.9,
      "color": "#color",
      "attributes": [{"name": "sleeve_length", "value": "short", "confidence": 0.8}]
    }
  ],
  "styleType": "casual|business|formal|sporty|bohemian|minimalist|vintage|trendy|classic|edgy|romantic|preppy",
  "formality": "very_casual|casual|smart_casual|business|formal|black_tie",
  "season": ["spring", "summer", "fall", "winter", "all_seasons"],
  "occasion": ["casual", "work", "formal", "party", "sports", "vacation", "date", "outdoor", "loungewear"],
  "tags": ["comfortable", "professional", "trendy"],
  "description": "Detailed description of the outfit",
  "feedback": "Constructive feedback and observations",
  "suggestions": [
    {
      "id": "1",
      "type": "color_combination|style_improvement|accessory_addition|fit_adjustment",
      "title": "Suggestion title",
      "description": "Detailed suggestion",
      "priority": "high|medium|low",
      "category": "color",
      "actionable": true
    }
  ],
  "colorAnalysis": {
    "dominant": {"hex": "#color", "name": "color_name", "percentage": 60},
    "secondary": [{"hex": "#color", "name": "color_name", "percentage": 25}],
    "harmony": "monochromatic|analogous|complementary|triadic|split_complementary|tetradic|neutral",
    "temperature": "warm|cool|neutral"
  },
  "patterns": [
    {
      "type": "solid|stripes|polka_dots|floral|geometric|abstract|animal_print|plaid|paisley|damask",
      "confidence": 0.9,
      "description": "Pattern description",
      "dominance": 0.8,
      "complexity": "simple|moderate|complex"
    }
  ],
  "styleScore": 85,
  "confidence": 0.9
}

Ensure the response is valid JSON only, no additional text.
`;

    return basePrompt;
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
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No analysis results from Gemini API');
      }

      const text = data.candidates[0].content.parts[0].text;
      return Result.ok<string>(text);
    } catch (error) {
      return Result.fail<string>(
        `Gemini API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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

  private parseGeminiResponse(responseText: string): Result<GeminiAnalysisResult> {
    try {
      // Clean the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonText = jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      // Validate required fields
      const required = ['styleType', 'formality', 'styleScore', 'confidence'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return Result.ok<GeminiAnalysisResult>(parsed);
    } catch (error) {
      return Result.fail<GeminiAnalysisResult>(
        `Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async createStyleAnalysis(
    input: StyleAnalysisInput,
    geminiResult: GeminiAnalysisResult
  ): Promise<Result<StyleAnalysis>> {
    try {
      // Convert Gemini result to domain entities
      const analysisResult: AnalysisResult = {
        dominantColors: geminiResult.dominantColors || [],
        secondaryColors: geminiResult.secondaryColors || [],
        detectedItems: geminiResult.detectedItems || [],
        styleType: this.mapStyleType(geminiResult.styleType),
        formality: this.mapFormalityLevel(geminiResult.formality),
        season: geminiResult.season?.map(s => this.mapSeason(s)) || [],
        occasion: geminiResult.occasion?.map(o => this.mapOccasion(o)) || [],
        tags: geminiResult.tags || [],
        description: geminiResult.description || '',
        feedback: geminiResult.feedback || '',
      };

      const suggestions: StyleSuggestion[] = (geminiResult.suggestions || []).map(s => ({
        id: s.id || Math.random().toString(36),
        type: this.mapSuggestionType(s.type),
        title: s.title || '',
        description: s.description || '',
        priority: this.mapPriority(s.priority),
        category: s.category || '',
        actionable: s.actionable || false,
      }));

      const colorPalette: ColorAnalysis = {
        dominant: geminiResult.colorAnalysis?.dominant || { hex: '#000000', name: 'black', percentage: 100 },
        secondary: geminiResult.colorAnalysis?.secondary || [],
        harmony: this.mapColorHarmony(geminiResult.colorAnalysis?.harmony),
        temperature: this.mapColorTemperature(geminiResult.colorAnalysis?.temperature),
      } as any;

      const patterns: PatternAnalysis[] = (geminiResult.patterns || []).map(p => ({
        type: this.mapPatternType(p.type),
        confidence: p.confidence || 0,
        description: p.description || '',
        dominance: p.dominance || 0,
        complexity: this.mapComplexityLevel(p.complexity),
      }));

      const processing = {
        processingTime: Date.now(),
        modelVersion: this.model,
        apiVersion: 'v1beta',
        processingDate: new Date(),
        retryCount: 0,
      };

      // Create StyleAnalysis entity
      const styleAnalysisProps = {
        imageUrl: input.imageUrl,
        analysisResult,
        suggestions,
        colorPalette,
        patterns,
        styleScore: Math.min(100, Math.max(1, geminiResult.styleScore || 50)),
        confidence: Math.min(1, Math.max(0, geminiResult.confidence || 0.5)),
        processing,
        userId: 'system', // This should be passed from the use case
      };

      const styleAnalysis = StyleAnalysis.create(styleAnalysisProps);
      return styleAnalysis;
    } catch (error) {
      return Result.fail<StyleAnalysis>(
        `Failed to create style analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Mapping functions
  private mapStyleType(value: string): StyleType {
    const mapping: Record<string, StyleType> = {
      casual: StyleType.CASUAL,
      business: StyleType.BUSINESS,
      formal: StyleType.FORMAL,
      sporty: StyleType.SPORTY,
      bohemian: StyleType.BOHEMIAN,
      minimalist: StyleType.MINIMALIST,
      vintage: StyleType.VINTAGE,
      trendy: StyleType.TRENDY,
      classic: StyleType.CLASSIC,
      edgy: StyleType.EDGY,
      romantic: StyleType.ROMANTIC,
      preppy: StyleType.PREPPY,
    };
    return mapping[value?.toLowerCase()] || StyleType.CASUAL;
  }

  private mapFormalityLevel(value: string): FormalityLevel {
    const mapping: Record<string, FormalityLevel> = {
      very_casual: FormalityLevel.VERY_CASUAL,
      casual: FormalityLevel.CASUAL,
      smart_casual: FormalityLevel.SMART_CASUAL,
      business: FormalityLevel.BUSINESS,
      formal: FormalityLevel.FORMAL,
      black_tie: FormalityLevel.BLACK_TIE,
    };
    return mapping[value?.toLowerCase()] || FormalityLevel.CASUAL;
  }

  private mapSeason(value: string): any {
    // This should map to Season enum from wardrobe domain
    return value;
  }

  private mapOccasion(value: string): any {
    // This should map to Occasion enum from wardrobe domain
    return value;
  }

  private mapSuggestionType(value: string): SuggestionType {
    const mapping: Record<string, SuggestionType> = {
      color_combination: SuggestionType.COLOR_COMBINATION,
      style_improvement: SuggestionType.STYLE_IMPROVEMENT,
      accessory_addition: SuggestionType.ACCESSORY_ADDITION,
      fit_adjustment: SuggestionType.FIT_ADJUSTMENT,
      seasonal_adaptation: SuggestionType.SEASONAL_ADAPTATION,
      occasion_matching: SuggestionType.OCCASION_MATCHING,
      pattern_mixing: SuggestionType.PATTERN_MIXING,
      layering: SuggestionType.LAYERING,
    };
    return mapping[value?.toLowerCase()] || SuggestionType.STYLE_IMPROVEMENT;
  }

  private mapPriority(value: string): Priority {
    const mapping: Record<string, Priority> = {
      high: Priority.HIGH,
      medium: Priority.MEDIUM,
      low: Priority.LOW,
    };
    return mapping[value?.toLowerCase()] || Priority.MEDIUM;
  }

  private mapColorHarmony(value: string): ColorHarmony {
    const mapping: Record<string, ColorHarmony> = {
      monochromatic: ColorHarmony.MONOCHROMATIC,
      analogous: ColorHarmony.ANALOGOUS,
      complementary: ColorHarmony.COMPLEMENTARY,
      triadic: ColorHarmony.TRIADIC,
      split_complementary: ColorHarmony.SPLIT_COMPLEMENTARY,
      tetradic: ColorHarmony.TETRADIC,
      neutral: ColorHarmony.NEUTRAL,
    };
    return mapping[value?.toLowerCase()] || ColorHarmony.NEUTRAL;
  }

  private mapColorTemperature(value: string): ColorTemperature {
    const mapping: Record<string, ColorTemperature> = {
      warm: ColorTemperature.WARM,
      cool: ColorTemperature.COOL,
      neutral: ColorTemperature.NEUTRAL,
    };
    return mapping[value?.toLowerCase()] || ColorTemperature.NEUTRAL;
  }

  private mapPatternType(value: string): PatternType {
    const mapping: Record<string, PatternType> = {
      solid: PatternType.SOLID,
      stripes: PatternType.STRIPES,
      polka_dots: PatternType.POLKA_DOTS,
      floral: PatternType.FLORAL,
      geometric: PatternType.GEOMETRIC,
      abstract: PatternType.ABSTRACT,
      animal_print: PatternType.ANIMAL_PRINT,
      plaid: PatternType.PLAID,
      paisley: PatternType.PAISLEY,
      damask: PatternType.DAMASK,
    };
    return mapping[value?.toLowerCase()] || PatternType.SOLID;
  }

  private mapComplexityLevel(value: string): ComplexityLevel {
    const mapping: Record<string, ComplexityLevel> = {
      simple: ComplexityLevel.SIMPLE,
      moderate: ComplexityLevel.MODERATE,
      complex: ComplexityLevel.COMPLEX,
    };
    return mapping[value?.toLowerCase()] || ComplexityLevel.SIMPLE;
  }
}

export class GeminiStyleAnalysisError extends StyleAnalysisError {
  constructor(message: string) {
    super(message, 'GEMINI_STYLE_ANALYSIS_ERROR');
  }
}

export class GeminiAPIError extends GeminiStyleAnalysisError {
  constructor(message: string) {
    super(`Gemini API error: ${message}`);
  }
}

export class InvalidResponseError extends GeminiStyleAnalysisError {
  constructor() {
    super('Invalid response format from Gemini API');
  }
}