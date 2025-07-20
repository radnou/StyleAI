import { StateCreator } from 'zustand';

/**
 * Style analysis result from AI
 */
export interface StyleAnalysis {
  id: string;
  imageUrl: string;
  analysisDate: Date;
  
  // AI Analysis Results
  detectedItems: {
    type: string;
    color: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  
  colorPalette: {
    dominant: string[];
    accent: string[];
    suggested: string[];
  };
  
  styleCategory: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  
  // Feedback and Suggestions
  feedback: {
    overall: 'excellent' | 'good' | 'fair' | 'needs_improvement';
    score: number; // 0-100
    strengths: string[];
    improvements: string[];
  };
  
  suggestions: {
    similar: string[]; // Similar outfit suggestions
    complement: string[]; // Complementary pieces
    occasion: string[]; // Better occasion matches
    colors: string[]; // Color recommendations
  };
  
  // Metadata
  occasion?: string;
  weather?: string;
  userRating?: number; // 1-5 stars
  userNotes?: string;
  isPublic: boolean;
  tags: string[];
}

/**
 * Outfit recommendation
 */
export interface OutfitRecommendation {
  id: string;
  name: string;
  occasion: string;
  weather?: string;
  items: string[]; // Array of wardrobe item IDs
  confidence: number;
  reasoning: string;
  createdAt: Date;
  isLiked?: boolean;
  isTried?: boolean;
}

/**
 * Style insights and stats
 */
export interface StyleInsights {
  mostWornColors: { color: string; count: number }[];
  favoriteStyles: { style: string; count: number }[];
  occasionBreakdown: { occasion: string; count: number }[];
  improvementAreas: string[];
  achievementBadges: {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
  }[];
}

/**
 * Style state
 */
export interface StyleState {
  analyses: StyleAnalysis[];
  recommendations: OutfitRecommendation[];
  insights: StyleInsights | null;
  isAnalyzing: boolean;
  isGeneratingRecommendations: boolean;
  error: string | null;
  lastAnalysisDate?: Date;
}

/**
 * Style actions
 */
export interface StyleActions {
  addStyleAnalysis: (analysis: Omit<StyleAnalysis, 'id' | 'analysisDate'>) => void;
  updateStyleAnalysis: (id: string, updates: Partial<StyleAnalysis>) => void;
  removeStyleAnalysis: (id: string) => void;
  setStyleAnalyses: (analyses: StyleAnalysis[]) => void;
  
  addRecommendation: (recommendation: Omit<OutfitRecommendation, 'id' | 'createdAt'>) => void;
  updateRecommendation: (id: string, updates: Partial<OutfitRecommendation>) => void;
  removeRecommendation: (id: string) => void;
  
  setInsights: (insights: StyleInsights) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  setGeneratingRecommendations: (isGenerating: boolean) => void;
  clearStyleError: () => void;
}

/**
 * Complete style slice interface
 */
export interface StyleSlice {
  style: StyleState;
  addStyleAnalysis: StyleActions['addStyleAnalysis'];
  updateStyleAnalysis: StyleActions['updateStyleAnalysis'];
  removeStyleAnalysis: StyleActions['removeStyleAnalysis'];
  setStyleAnalyses: StyleActions['setStyleAnalyses'];
  addRecommendation: StyleActions['addRecommendation'];
  updateRecommendation: StyleActions['updateRecommendation'];
  removeRecommendation: StyleActions['removeRecommendation'];
  setInsights: StyleActions['setInsights'];
  setAnalyzing: StyleActions['setAnalyzing'];
  setGeneratingRecommendations: StyleActions['setGeneratingRecommendations'];
  clearStyleError: StyleActions['clearStyleError'];
}

/**
 * Initial style state
 */
const initialStyleState: StyleState = {
  analyses: [],
  recommendations: [],
  insights: null,
  isAnalyzing: false,
  isGeneratingRecommendations: false,
  error: null,
};

/**
 * Creates the style store slice
 */
export const createStyleSlice: StateCreator<
  any,
  [['zustand/immer', never]],
  [],
  StyleSlice
> = (set) => ({
  style: initialStyleState,

  addStyleAnalysis: (newAnalysis) => {
    set((state: any) => {
      const analysis: StyleAnalysis = {
        ...newAnalysis,
        id: Date.now().toString(),
        analysisDate: new Date(),
      };
      
      state.style.analyses.unshift(analysis); // Add to beginning
      state.style.lastAnalysisDate = analysis.analysisDate;
      state.style.error = null;
    });
  },

  updateStyleAnalysis: (id, updates) => {
    set((state: any) => {
      const analysisIndex = state.style.analyses.findIndex(analysis => analysis.id === id);
      if (analysisIndex !== -1) {
        Object.assign(state.style.analyses[analysisIndex], updates);
        state.style.error = null;
      }
    });
  },

  removeStyleAnalysis: (id) => {
    set((state: any) => {
      state.style.analyses = state.style.analyses.filter(analysis => analysis.id !== id);
      state.style.error = null;
    });
  },

  setStyleAnalyses: (analyses) => {
    set((state: any) => {
      state.style.analyses = analyses;
      if (analyses.length > 0) {
        state.style.lastAnalysisDate = analyses[0].analysisDate;
      }
      state.style.error = null;
    });
  },

  addRecommendation: (newRecommendation) => {
    set((state: any) => {
      const recommendation: OutfitRecommendation = {
        ...newRecommendation,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      
      state.style.recommendations.unshift(recommendation);
      state.style.error = null;
    });
  },

  updateRecommendation: (id, updates) => {
    set((state: any) => {
      const recommendationIndex = state.style.recommendations.findIndex(rec => rec.id === id);
      if (recommendationIndex !== -1) {
        Object.assign(state.style.recommendations[recommendationIndex], updates);
        state.style.error = null;
      }
    });
  },

  removeRecommendation: (id) => {
    set((state: any) => {
      state.style.recommendations = state.style.recommendations.filter(rec => rec.id !== id);
      state.style.error = null;
    });
  },

  setInsights: (insights) => {
    set((state: any) => {
      state.style.insights = insights;
      state.style.error = null;
    });
  },

  setAnalyzing: (isAnalyzing) => {
    set((state: any) => {
      state.style.isAnalyzing = isAnalyzing;
      if (isAnalyzing) {
        state.style.error = null;
      }
    });
  },

  setGeneratingRecommendations: (isGenerating) => {
    set((state: any) => {
      state.style.isGeneratingRecommendations = isGenerating;
      if (isGenerating) {
        state.style.error = null;
      }
    });
  },

  clearStyleError: () => {
    set((state: any) => {
      state.style.error = null;
    });
  },
});