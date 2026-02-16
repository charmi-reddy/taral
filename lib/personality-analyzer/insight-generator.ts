import type { DrawingMetrics, PersonalityInsight, PersonalityType } from './types';

export class InsightGenerator {
  private readonly insightRules: Array<{
    condition: (m: DrawingMetrics) => boolean;
    insight: PersonalityInsight;
  }> = [
    {
      condition: (m) => m.averageSpeed !== null && m.averageSpeed > 2.0,
      insight: {
        text: "Fast, energetic strokes — high creative impulse",
        category: "creativity",
        metric: "averageSpeed"
      }
    },
    {
      condition: (m) => m.averageSpeed !== null && m.averageSpeed < 1.0,
      insight: {
        text: "Slow, deliberate strokes — thoughtful approach",
        category: "control",
        metric: "averageSpeed"
      }
    },
    {
      condition: (m) => m.smoothness > 0.7,
      insight: {
        text: "Smooth, controlled lines — methodical thinker",
        category: "control",
        metric: "smoothness"
      }
    },
    {
      condition: (m) => m.smoothness < 0.4,
      insight: {
        text: "Dynamic, varied strokes — spontaneous style",
        category: "creativity",
        metric: "smoothness"
      }
    },
    {
      condition: (m) => m.colorDiversity > 5,
      insight: {
        text: "Colorful palette — expressive personality",
        category: "expression",
        metric: "colorDiversity"
      }
    },
    {
      condition: (m) => m.colorDiversity < 3,
      insight: {
        text: "Focused color choice — minimalist aesthetic",
        category: "focus",
        metric: "colorDiversity"
      }
    },
    {
      condition: (m) => m.pressureVariance !== null && m.pressureVariance < 0.3,
      insight: {
        text: "Consistent pressure — steady and focused",
        category: "focus",
        metric: "pressureVariance"
      }
    },
    {
      condition: (m) => m.pressureVariance !== null && m.pressureVariance > 0.6,
      insight: {
        text: "Varied pressure — expressive and dynamic",
        category: "expression",
        metric: "pressureVariance"
      }
    },
    {
      condition: (m) => m.brushVariety > 4,
      insight: {
        text: "Loves experimenting with different tools",
        category: "experimentation",
        metric: "brushVariety"
      }
    },
    {
      condition: (m) => m.directionChanges > 50,
      insight: {
        text: "Complex, intricate patterns — detail-oriented",
        category: "detail",
        metric: "directionChanges"
      }
    },
    {
      condition: (m) => m.directionChanges < 20,
      insight: {
        text: "Simple, flowing lines — elegant simplicity",
        category: "simplicity",
        metric: "directionChanges"
      }
    },
  ];

  private readonly personalityTypes: Array<{
    name: string;
    description: string;
    traits: string[];
    condition: (insights: PersonalityInsight[]) => boolean;
  }> = [
    {
      name: "The Spontaneous Creator",
      description: "You draw with energy and freedom, letting creativity flow naturally",
      traits: ["Creative", "Spontaneous", "Expressive"],
      condition: (insights) =>
        insights.some(i => i.category === "creativity") &&
        insights.some(i => i.category === "expression")
    },
    {
      name: "The Methodical Artist",
      description: "You approach drawing with precision and careful thought",
      traits: ["Controlled", "Focused", "Deliberate"],
      condition: (insights) =>
        insights.some(i => i.category === "control") &&
        insights.some(i => i.category === "focus")
    },
    {
      name: "The Bold Experimenter",
      description: "You love trying new techniques and pushing boundaries",
      traits: ["Experimental", "Adventurous", "Diverse"],
      condition: (insights) =>
        insights.some(i => i.category === "experimentation") &&
        insights.length > 4
    },
    {
      name: "The Focused Minimalist",
      description: "You believe in the power of simplicity and restraint",
      traits: ["Minimalist", "Focused", "Refined"],
      condition: (insights) =>
        insights.some(i => i.category === "focus") &&
        insights.some(i => i.category === "simplicity")
    },
    {
      name: "The Expressive Storyteller",
      description: "Your drawings are full of emotion and narrative",
      traits: ["Expressive", "Colorful", "Dynamic"],
      condition: (insights) =>
        insights.some(i => i.category === "expression") &&
        insights.some(i => i.metric === "colorDiversity")
    },
    {
      name: "The Steady Hand",
      description: "You draw with consistency and calm confidence",
      traits: ["Steady", "Consistent", "Reliable"],
      condition: (insights) =>
        insights.some(i => i.category === "focus") &&
        insights.some(i => i.metric === "pressureVariance")
    },
  ];

  generateInsights(metrics: DrawingMetrics): PersonalityInsight[] {
    const insights: PersonalityInsight[] = [];

    for (const rule of this.insightRules) {
      if (rule.condition(metrics)) {
        insights.push(rule.insight);
      }
    }

    // Ensure at least 3 insights
    if (insights.length < 3) {
      // Add generic insights based on available data
      if (metrics.totalStrokes > 10) {
        insights.push({
          text: "Prolific doodler — loves to create",
          category: "creativity",
          metric: "totalStrokes"
        });
      }
      if (metrics.totalPoints > 100) {
        insights.push({
          text: "Detailed work — patient and thorough",
          category: "detail",
          metric: "totalPoints"
        });
      }
    }

    return insights.slice(0, 6); // Return max 6 insights
  }

  determinePersonalityType(insights: PersonalityInsight[]): PersonalityType {
    for (const type of this.personalityTypes) {
      if (type.condition(insights)) {
        return {
          name: type.name,
          description: type.description,
          traits: type.traits,
        };
      }
    }

    // Default type
    return {
      name: "The Creative Spirit",
      description: "You have a unique drawing style all your own",
      traits: ["Creative", "Unique", "Individual"],
    };
  }
}
