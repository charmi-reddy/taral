# Design Document: Doodle Personality Analyzer

## Overview

The Doodle Personality Analyzer is a client-side feature that processes drawing stroke data to generate entertaining personality insights. The system analyzes quantifiable drawing patterns (speed, pressure, smoothness, variety) and maps them to personality traits through a rule-based insight generation engine.

The feature consists of three main components:
1. **Metrics Calculator**: Processes raw stroke data to compute quantifiable metrics
2. **Insight Generator**: Maps metrics to personality insights using threshold-based rules
3. **Analysis UI**: Presents results in an engaging, shareable modal interface

The design prioritizes fun and engagement over scientific accuracy, using playful language and visual presentation to create an enjoyable user experience.

## Architecture

### Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                      HomeView                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  "Analyze Personality" Button                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PersonalityAnalysisModal                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Analysis Results Display                         │  │
│  │  - Metrics Visualization                          │  │
│  │  - Personality Insights                           │  │
│  │  - Personality Type Badge                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              PersonalityAnalyzer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  MetricsCalculator                                │  │
│  │  - calculateSpeed()                               │  │
│  │  - calculatePressureVariance()                    │  │
│  │  - calculateSmoothness()                          │  │
│  │  - calculateDirectionChanges()                    │  │
│  │  - calculateBrushVariety()                        │  │
│  │  - calculateColorDiversity()                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  InsightGenerator                                 │  │
│  │  - generateInsights()                             │  │
│  │  - determinePersonalityType()                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Data Layer                                 │
│  - Stroke data from existing Point[] arrays            │
│  - Page/doodle metadata                                │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. User clicks "Analyze Personality" button on home page
2. UI component retrieves stroke data from current doodle or all doodles
3. PersonalityAnalyzer receives stroke data and computes metrics
4. InsightGenerator maps metrics to personality insights
5. Results are returned to UI component
6. Modal displays metrics, insights, and personality type

## Components and Interfaces

### Core Types

```typescript
interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

interface Stroke {
  points: Point[];
  brushType?: string;
  color?: string;
}

interface DoodleData {
  id: string;
  strokes: Stroke[];
}

interface DrawingMetrics {
  averageSpeed: number | null;          // pixels per millisecond
  pressureVariance: number | null;      // 0-1 range
  smoothness: number;                   // 0-1 range (1 = very smooth)
  directionChanges: number;             // count of significant angle changes
  brushVariety: number;                 // count of unique brush types
  colorDiversity: number;               // count of unique colors
  totalStrokes: number;
  totalPoints: number;
}

interface PersonalityInsight {
  text: string;                         // e.g., "Fast, chaotic strokes — high creative impulse"
  category: string;                     // e.g., "creativity", "control", "expression"
  metric: keyof DrawingMetrics;         // which metric triggered this insight
}

interface PersonalityType {
  name: string;                         // e.g., "The Spontaneous Creator"
  description: string;                  // brief description
  traits: string[];                     // list of key traits
}

interface AnalysisResult {
  success: boolean;
  metrics?: DrawingMetrics;
  insights?: PersonalityInsight[];
  personalityType?: PersonalityType;
  error?: string;
}
```

### MetricsCalculator

The MetricsCalculator processes raw stroke data to compute quantifiable metrics.

```typescript
class MetricsCalculator {
  calculateSpeed(strokes: Stroke[]): number | null {
    // Filter strokes with valid timestamps
    // For each stroke, calculate distance between consecutive points
    // Divide by time difference to get speed
    // Return average speed across all strokes
    // Return null if insufficient timestamp data
  }

  calculatePressureVariance(strokes: Stroke[]): number | null {
    // Collect all pressure values from all points
    // Calculate variance (standard deviation / mean)
    // Normalize to 0-1 range
    // Return null if no pressure data available
  }

  calculateSmoothness(strokes: Stroke[]): number {
    // For each stroke, calculate angles between consecutive segments
    // Count small angle changes (< 15 degrees) vs large changes
    // Smoothness = small_changes / total_changes
    // Return value between 0 (chaotic) and 1 (smooth)
  }

  calculateDirectionChanges(strokes: Stroke[]): number {
    // For each stroke, calculate angle between consecutive segments
    // Count changes > 30 degrees as significant direction changes
    // Return total count across all strokes
  }

  calculateBrushVariety(strokes: Stroke[]): number {
    // Extract brush types from all strokes
    // Return count of unique brush types
    // Return 0 if no brush data available
  }

  calculateColorDiversity(strokes: Stroke[]): number {
    // Extract colors from all strokes
    // Return count of unique colors
    // Return 0 if no color data available
  }

  calculateMetrics(doodleData: DoodleData): DrawingMetrics {
    // Aggregate all strokes from doodle
    // Call individual metric calculation methods
    // Return complete DrawingMetrics object
  }

  aggregateMetrics(doodles: DoodleData[]): DrawingMetrics {
    // Calculate metrics for each doodle
    // Compute weighted average based on stroke count
    // Return aggregated DrawingMetrics
  }
}
```

### InsightGenerator

The InsightGenerator maps metrics to personality insights using threshold-based rules.

```typescript
class InsightGenerator {
  private readonly insightRules = [
    {
      condition: (m: DrawingMetrics) => m.averageSpeed !== null && m.averageSpeed > 2.0,
      insight: {
        text: "Fast, energetic strokes — high creative impulse",
        category: "creativity",
        metric: "averageSpeed"
      }
    },
    {
      condition: (m: DrawingMetrics) => m.smoothness > 0.7,
      insight: {
        text: "Smooth, controlled lines — methodical thinker",
        category: "control",
        metric: "smoothness"
      }
    },
    {
      condition: (m: DrawingMetrics) => m.colorDiversity > 5,
      insight: {
        text: "Colorful palette — expressive personality",
        category: "expression",
        metric: "colorDiversity"
      }
    },
    {
      condition: (m: DrawingMetrics) => m.pressureVariance !== null && m.pressureVariance < 0.3,
      insight: {
        text: "Consistent pressure — steady and focused",
        category: "focus",
        metric: "pressureVariance"
      }
    },
    // Additional rules for other metric combinations
  ];

  private readonly personalityTypes = [
    {
      name: "The Spontaneous Creator",
      description: "You draw with energy and freedom",
      traits: ["creative", "spontaneous", "expressive"],
      condition: (insights: PersonalityInsight[]) => 
        insights.some(i => i.category === "creativity") &&
        insights.some(i => i.category === "expression")
    },
    {
      name: "The Methodical Artist",
      description: "You approach drawing with precision",
      traits: ["controlled", "focused", "deliberate"],
      condition: (insights: PersonalityInsight[]) =>
        insights.some(i => i.category === "control") &&
        insights.some(i => i.category === "focus")
    },
    // Additional personality types
  ];

  generateInsights(metrics: DrawingMetrics): PersonalityInsight[] {
    // Evaluate each rule against metrics
    // Collect matching insights
    // Return at least 3 insights (or all that match)
  }

  determinePersonalityType(insights: PersonalityInsight[]): PersonalityType {
    // Evaluate personality type conditions against insights
    // Return first matching type
    // Return default type if no match
  }
}
```

### PersonalityAnalyzer

The main analyzer orchestrates metric calculation and insight generation.

```typescript
class PersonalityAnalyzer {
  private metricsCalculator: MetricsCalculator;
  private insightGenerator: InsightGenerator;

  analyzeDoodle(doodleData: DoodleData): AnalysisResult {
    // Validate doodle has sufficient data
    // Calculate metrics using MetricsCalculator
    // Generate insights using InsightGenerator
    // Determine personality type
    // Return AnalysisResult
  }

  analyzeOverallProfile(doodles: DoodleData[]): AnalysisResult {
    // Validate at least one doodle exists
    // Aggregate metrics across all doodles
    // Generate insights from aggregated metrics
    // Determine personality type
    // Return AnalysisResult
  }

  private validateData(doodleData: DoodleData): boolean {
    // Check if strokes array is not empty
    // Check if at least one stroke has more than one point
    // Return true if valid, false otherwise
  }
}
```

### UI Components

#### PersonalityAnalysisModal

```typescript
interface PersonalityAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: AnalysisResult;
  analysisType: "doodle" | "profile";
}

// Modal displays:
// - Loading state during analysis
// - Error message if analysis fails
// - Metrics with visual indicators (progress bars)
// - Personality insights with emphasis styling
// - Personality type badge with icon
// - Close button
```

#### HomeView Integration

```typescript
// Add "Analyze Personality" button to HomeView
// Button triggers modal open
// Modal fetches current doodle data or all doodles
// Modal passes data to PersonalityAnalyzer
// Modal displays results
```

## Data Models

### Metric Thresholds

The system uses the following thresholds for insight generation:

| Metric | Low | Medium | High |
|--------|-----|--------|------|
| Average Speed | < 1.0 px/ms | 1.0-2.0 px/ms | > 2.0 px/ms |
| Pressure Variance | < 0.3 | 0.3-0.6 | > 0.6 |
| Smoothness | < 0.4 | 0.4-0.7 | > 0.7 |
| Direction Changes | < 20 | 20-50 | > 50 |
| Brush Variety | < 2 | 2-4 | > 4 |
| Color Diversity | < 3 | 3-5 | > 5 |

### Personality Type Categories

The system defines 6 personality types based on insight combinations:

1. **The Spontaneous Creator**: High speed + high color diversity
2. **The Methodical Artist**: High smoothness + low pressure variance
3. **The Bold Experimenter**: High brush variety + high direction changes
4. **The Focused Minimalist**: Low color diversity + high smoothness
5. **The Expressive Storyteller**: High color diversity + medium speed
6. **The Steady Hand**: Low pressure variance + low direction changes

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Metric Calculation Correctness

*For any* valid stroke data with timestamps and positions, calculating average speed should produce a value equal to the total distance traveled divided by the total time elapsed.

**Validates: Requirements 1.1**

### Property 2: Pressure Variance Calculation

*For any* stroke data with pressure values, the calculated pressure variance should equal the statistical variance of all pressure values normalized to the 0-1 range.

**Validates: Requirements 1.2**

### Property 3: Direction Change Detection

*For any* stroke with at least 3 points, the number of direction changes should equal the count of angle differences greater than 30 degrees between consecutive segments.

**Validates: Requirements 1.3**

### Property 4: Smoothness Calculation

*For any* stroke data, the smoothness metric should be inversely proportional to the frequency of direction changes (more changes = lower smoothness).

**Validates: Requirements 1.4**

### Property 5: Multi-Stroke Aggregation

*For any* doodle with multiple strokes, aggregated metrics should be computed as the weighted average of individual stroke metrics based on point count.

**Validates: Requirements 1.5**

### Property 6: Brush Variety Counting

*For any* doodle, the brush variety count should equal the number of unique brush type identifiers across all strokes.

**Validates: Requirements 2.1**

### Property 7: Color Diversity Counting

*For any* doodle, the color diversity count should equal the number of unique color values across all strokes.

**Validates: Requirements 2.2, 2.3**

### Property 8: Threshold-Based Insight Generation

*For any* metrics object where a metric exceeds its defined threshold, the generated insights should include at least one insight corresponding to that metric's category.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 9: Personality Type Assignment

*For any* set of generated insights, a personality type should be assigned based on the combination of insight categories present.

**Validates: Requirements 3.5**

### Property 10: Minimum Insight Count

*For any* valid doodle analysis with sufficient data, the result should contain at least 3 personality insights.

**Validates: Requirements 3.6**

### Property 11: Single Doodle Isolation

*For any* specific doodle ID in a collection of doodles, analyzing that doodle should produce metrics derived only from that doodle's stroke data and not from other doodles.

**Validates: Requirements 4.1**

### Property 12: Per-Doodle Result Display

*For any* analysis result for a specific doodle, the rendered modal should contain all metrics and insights from that analysis result.

**Validates: Requirements 4.2, 4.3**

### Property 13: Overall Profile Aggregation

*For any* collection of doodles, the overall profile metrics should be the weighted average of individual doodle metrics, weighted by stroke count.

**Validates: Requirements 5.1, 5.2**

### Property 14: Dominant Trait Identification

*For any* overall profile analysis, the generated insights should reflect the most frequently occurring insight categories across all individual doodle analyses.

**Validates: Requirements 5.3**

### Property 15: Visual Indicator Presence

*For any* rendered analysis result, the modal HTML should contain visual indicator elements (progress bars or badges) for each displayed metric.

**Validates: Requirements 7.1**

### Property 16: Personality Type Display

*For any* analysis result with a personality type, the rendered modal should contain a distinct visual element displaying that personality type's name and description.

**Validates: Requirements 7.3**

## Error Handling

The system handles errors gracefully at multiple levels:

### Data Validation Errors

- **Empty stroke data**: Return `AnalysisResult` with `success: false` and error message "No drawing data available to analyze"
- **Single-point strokes**: Return error message "Insufficient drawing data - need at least 2 points per stroke"
- **No doodles for profile**: Return error message "No doodles available for profile analysis"

### Missing Data Handling

- **Missing pressure data**: Skip pressure variance calculation, set value to `null`, continue with other metrics
- **Missing timestamp data**: Skip speed calculation, set value to `null`, continue with other metrics
- **Missing brush/color data**: Set brush variety and color diversity to 0, continue with other metrics

### Calculation Errors

- **Division by zero**: Handle gracefully by returning `null` for that metric
- **Invalid angle calculations**: Skip problematic segments, continue with remaining data
- **NaN or Infinity results**: Exclude metric from results, log warning

### UI Error States

- **Analysis failure**: Display error message in modal with friendly explanation
- **Loading timeout**: Show message "Analysis is taking longer than expected"
- **No insights generated**: Display message "Not enough varied data to generate insights - try drawing more!"

## Testing Strategy

The Doodle Personality Analyzer will use a dual testing approach combining unit tests and property-based tests.

### Unit Testing

Unit tests will focus on:
- Specific examples demonstrating correct metric calculations
- Edge cases (empty data, single points, missing fields)
- Error handling scenarios
- UI component rendering with known inputs
- Modal open/close interactions

Example unit tests:
- Test speed calculation with known point coordinates and timestamps
- Test that empty stroke array returns error result
- Test that modal displays loading state initially
- Test that close button triggers onClose callback

### Property-Based Testing

Property-based tests will verify universal properties across randomized inputs using a PBT library (fast-check for TypeScript/JavaScript).

Each property test will:
- Run minimum 100 iterations with randomized inputs
- Reference the design document property number
- Use tag format: **Feature: doodle-personality-analyzer, Property {N}: {property text}**

Example property tests:
- **Property 1**: Generate random stroke data, verify speed calculation matches manual computation
- **Property 7**: Generate random strokes with colors, verify color count equals unique colors
- **Property 10**: Generate random valid doodles, verify at least 3 insights returned

### Test Configuration

```typescript
// Property test configuration
import fc from 'fast-check';

describe('PersonalityAnalyzer Properties', () => {
  it('Property 1: Metric Calculation Correctness', () => {
    fc.assert(
      fc.property(
        strokeDataArbitrary(),
        (strokeData) => {
          const result = analyzer.calculateSpeed(strokeData);
          const expected = manualSpeedCalculation(strokeData);
          expect(result).toBeCloseTo(expected, 2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify:
- End-to-end flow from button click to modal display
- Data retrieval from page manager
- Analyzer integration with UI components
- Multiple doodle aggregation

### Coverage Goals

- Unit test coverage: 80%+ for core logic
- Property test coverage: All 16 correctness properties implemented
- Edge case coverage: All error handling paths tested
- UI component coverage: All interactive elements tested

