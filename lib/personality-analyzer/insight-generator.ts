import type { DrawingMetrics, PersonalityInsight, PersonalityType } from './types';
import { getRandomQuote } from './quotes';

export class InsightGenerator {
  private readonly insightRules: Array<{
    condition: (m: DrawingMetrics) => boolean;
    insight: PersonalityInsight;
  }> = [
    {
      condition: (m) => m.averageSpeed !== null && m.averageSpeed > 2.0,
      insight: {
        text: "Whoa, you draw FAST! Your hand barely touches the screen before zooming to the next idea",
        category: "creativity",
        metric: "averageSpeed"
      }
    },
    {
      condition: (m) => m.averageSpeed !== null && m.averageSpeed < 1.0,
      insight: {
        text: "You take your sweet time with each stroke. Every line gets the attention it deserves",
        category: "control",
        metric: "averageSpeed"
      }
    },
    {
      condition: (m) => m.smoothness > 0.7,
      insight: {
        text: "Your lines flow like butter. Smooth, controlled, and oddly satisfying to look at",
        category: "control",
        metric: "smoothness"
      }
    },
    {
      condition: (m) => m.smoothness < 0.4,
      insight: {
        text: "Zigzags, curves, chaos! Your strokes go wherever they feel like going",
        category: "creativity",
        metric: "smoothness"
      }
    },
    {
      condition: (m) => m.colorDiversity > 5,
      insight: {
        text: "Rainbow vibes! You're not afraid to throw every color at the canvas",
        category: "expression",
        metric: "colorDiversity"
      }
    },
    {
      condition: (m) => m.colorDiversity < 3,
      insight: {
        text: "You stick to your favorites. Why mess with a good thing?",
        category: "focus",
        metric: "colorDiversity"
      }
    },
    {
      condition: (m) => m.pressureVariance !== null && m.pressureVariance < 0.3,
      insight: {
        text: "Steady hand alert! Your pressure stays consistent like you're on autopilot",
        category: "focus",
        metric: "pressureVariance"
      }
    },
    {
      condition: (m) => m.pressureVariance !== null && m.pressureVariance > 0.6,
      insight: {
        text: "You press hard, then soft, then hard again. Your doodle has FEELINGS",
        category: "expression",
        metric: "pressureVariance"
      }
    },
    {
      condition: (m) => m.brushVariety > 4,
      insight: {
        text: "Brush collector spotted! You've tried almost every tool in the box",
        category: "experimentation",
        metric: "brushVariety"
      }
    },
    {
      condition: (m) => m.directionChanges > 50,
      insight: {
        text: "Your hand never stops turning. This doodle went on a JOURNEY",
        category: "detail",
        metric: "directionChanges"
      }
    },
    {
      condition: (m) => m.directionChanges < 20,
      insight: {
        text: "Straight shooter! Your lines know where they're going and stick to it",
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
      name: "The Wild Scribbler",
      description: "You doodle like nobody's watching. Fast, colorful, and totally unfiltered",
      traits: ["Spontaneous", "Energetic", "Bold"],
      condition: (insights) =>
        insights.some(i => i.category === "creativity") &&
        insights.some(i => i.category === "expression")
    },
    {
      name: "The Perfectionist",
      description: "Every line matters. You're not done until it looks EXACTLY right",
      traits: ["Precise", "Patient", "Detail-Focused"],
      condition: (insights) =>
        insights.some(i => i.category === "control") &&
        insights.some(i => i.category === "focus")
    },
    {
      name: "The Tool Hoarder",
      description: "Why use one brush when you can use ALL the brushes?",
      traits: ["Curious", "Adventurous", "Playful"],
      condition: (insights) =>
        insights.some(i => i.category === "experimentation") &&
        insights.length > 4
    },
    {
      name: "The Minimalist",
      description: "Less is more. You know exactly what you want and nothing else matters",
      traits: ["Focused", "Intentional", "Clean"],
      condition: (insights) =>
        insights.some(i => i.category === "focus") &&
        insights.some(i => i.category === "simplicity")
    },
    {
      name: "The Mood Painter",
      description: "Your doodles have VIBES. Colors, pressure, emotion - it's all there",
      traits: ["Expressive", "Emotional", "Vibrant"],
      condition: (insights) =>
        insights.some(i => i.category === "expression") &&
        insights.some(i => i.metric === "colorDiversity")
    },
    {
      name: "The Zen Master",
      description: "Calm, steady, consistent. Doodling is your meditation",
      traits: ["Calm", "Balanced", "Grounded"],
      condition: (insights) =>
        insights.some(i => i.category === "focus") &&
        insights.some(i => i.metric === "pressureVariance")
    },
  ];

  generateInsights(metrics: DrawingMetrics): PersonalityInsight[] {
    // Return just ONE random quote
    const randomQuote = getRandomQuote();
    
    return [{
      text: randomQuote,
      category: "personality",
      metric: "totalStrokes" // Generic metric
    }];
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
      name: "The Free Spirit",
      description: "You do your own thing and that's what makes your doodles special",
      traits: ["Unique", "Original", "You"],
    };
  }
}
