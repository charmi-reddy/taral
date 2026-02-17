/**
 * Gemini Vision API Client for subject detection in images
 */

export interface GeminiVisionResponse {
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
  error?: string;
}

export class GeminiVisionClient {
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(apiKey?: string, timeout: number = 10000, maxRetries: number = 2) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    this.timeout = timeout;
    this.maxRetries = maxRetries;
  }

  /**
   * Analyze an image to detect the main subject
   * @param imageBase64 - Base64 encoded PNG image
   * @param prompt - Detection prompt
   * @returns Promise resolving to GeminiVisionResponse
   */
  async analyzeImage(imageBase64: string, prompt: string): Promise<GeminiVisionResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(imageBase64, prompt);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Gemini API attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on the last attempt
        if (attempt < this.maxRetries) {
          // Wait before retrying (exponential backoff)
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || new Error('Gemini API request failed');
  }

  /**
   * Make a request to the Gemini Vision API
   */
  private async makeRequest(imageBase64: string, prompt: string): Promise<GeminiVisionResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: 'image/png',
                    data: imageBase64
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 256,
            }
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Gemini API request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Parse the Gemini API response to extract bounding box
   */
  private parseResponse(data: any): GeminiVisionResponse {
    try {
      // Extract text from response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        return { error: 'No response text from Gemini API' };
      }

      // Try to extract bounding box coordinates from the response
      // Expected format: x: <number>, y: <number>, width: <number>, height: <number>
      // or JSON format: {"x": <number>, "y": <number>, "width": <number>, "height": <number>}
      
      // Try JSON parsing first
      const jsonMatch = text.match(/\{[^}]*"x"[^}]*\}/);
      if (jsonMatch) {
        try {
          const bbox = JSON.parse(jsonMatch[0]);
          if (this.isValidBoundingBox(bbox)) {
            return {
              boundingBox: {
                x: Number(bbox.x),
                y: Number(bbox.y),
                width: Number(bbox.width),
                height: Number(bbox.height),
              },
              confidence: 0.85, // Default confidence for AI detection
            };
          }
        } catch (e) {
          // Fall through to regex parsing
        }
      }

      // Try regex parsing
      const xMatch = text.match(/x[:\s]+(\d+(?:\.\d+)?)/i);
      const yMatch = text.match(/y[:\s]+(\d+(?:\.\d+)?)/i);
      const widthMatch = text.match(/width[:\s]+(\d+(?:\.\d+)?)/i);
      const heightMatch = text.match(/height[:\s]+(\d+(?:\.\d+)?)/i);

      if (xMatch && yMatch && widthMatch && heightMatch) {
        return {
          boundingBox: {
            x: parseFloat(xMatch[1]),
            y: parseFloat(yMatch[1]),
            width: parseFloat(widthMatch[1]),
            height: parseFloat(heightMatch[1]),
          },
          confidence: 0.85,
        };
      }

      return { error: 'Could not parse bounding box from response' };
    } catch (error) {
      return { error: `Failed to parse response: ${error}` };
    }
  }

  /**
   * Validate bounding box has required properties
   */
  private isValidBoundingBox(bbox: any): boolean {
    return (
      bbox &&
      typeof bbox.x === 'number' &&
      typeof bbox.y === 'number' &&
      typeof bbox.width === 'number' &&
      typeof bbox.height === 'number' &&
      bbox.width > 0 &&
      bbox.height > 0
    );
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
