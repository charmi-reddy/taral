import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { metrics } = await request.json();
    
    // Prepare metrics summary for the LLM
    const metricsSummary = {
      speed: metrics.averageSpeed ? (metrics.averageSpeed > 2 ? 'fast' : metrics.averageSpeed < 1 ? 'slow' : 'medium') : 'unknown',
      smoothness: metrics.smoothness > 0.7 ? 'smooth' : metrics.smoothness < 0.4 ? 'chaotic' : 'moderate',
      colors: metrics.colorDiversity > 5 ? 'many' : metrics.colorDiversity < 3 ? 'few' : 'some',
      brushes: metrics.brushVariety > 4 ? 'many' : metrics.brushVariety < 2 ? 'few' : 'some',
      pressure: metrics.pressureVariance !== null ? (metrics.pressureVariance < 0.3 ? 'consistent' : metrics.pressureVariance > 0.6 ? 'varied' : 'moderate') : 'unknown',
      complexity: metrics.directionChanges > 50 ? 'complex' : metrics.directionChanges < 20 ? 'simple' : 'moderate',
    };

    // Call Google Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a fun, casual personality analyzer for doodles. Generate ONE short, playful quote (max 15 words) about the drawing style. Be conversational, use exclamation marks, and sound like a friend commenting. No formal language. Examples: "Whoa, you draw FAST!", "Rainbow vibes everywhere!", "Your lines are so smooth it's hypnotic"

Generate a fun personality quote for a doodle with these characteristics: ${JSON.stringify(metricsSummary)}`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 50,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error('Gemini API request failed');
    }

    const data = await response.json();
    const quote = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!quote) {
      throw new Error('No quote generated');
    }

    return NextResponse.json({ quote, source: 'llm' });
  } catch (error) {
    console.error('Error generating quote:', error);
    // Return error so client can fallback to local quotes
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
