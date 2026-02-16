import { MetricsCalculator } from './metrics-calculator';
import { InsightGenerator } from './insight-generator';
import type { DoodleData, AnalysisResult } from './types';

export class PersonalityAnalyzer {
  private metricsCalculator: MetricsCalculator;
  private insightGenerator: InsightGenerator;

  constructor() {
    this.metricsCalculator = new MetricsCalculator();
    this.insightGenerator = new InsightGenerator();
  }

  analyzeDoodle(doodleData: DoodleData): AnalysisResult {
    if (!this.validateData(doodleData)) {
      return {
        success: false,
        error: "Insufficient drawing data - need at least 2 points per stroke"
      };
    }

    try {
      const metrics = this.metricsCalculator.calculateMetrics(doodleData);
      const insights = this.insightGenerator.generateInsights(metrics);
      const personalityType = this.insightGenerator.determinePersonalityType(insights);

      return {
        success: true,
        metrics,
        insights,
        personalityType,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to analyze doodle: " + (error instanceof Error ? error.message : String(error))
      };
    }
  }

  analyzeOverallProfile(doodles: DoodleData[]): AnalysisResult {
    if (doodles.length === 0) {
      return {
        success: false,
        error: "No doodles available for profile analysis"
      };
    }

    const validDoodles = doodles.filter(d => this.validateData(d));
    
    if (validDoodles.length === 0) {
      return {
        success: false,
        error: "No valid doodles with sufficient data"
      };
    }

    try {
      const metrics = this.metricsCalculator.aggregateMetrics(validDoodles);
      const insights = this.insightGenerator.generateInsights(metrics);
      const personalityType = this.insightGenerator.determinePersonalityType(insights);

      return {
        success: true,
        metrics,
        insights,
        personalityType,
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to analyze profile: " + (error instanceof Error ? error.message : String(error))
      };
    }
  }

  private validateData(doodleData: DoodleData): boolean {
    if (!doodleData.strokes || doodleData.strokes.length === 0) {
      return false;
    }

    // Check if at least one stroke has more than one point
    return doodleData.strokes.some(stroke => stroke.points && stroke.points.length > 1);
  }
}

export * from './types';
