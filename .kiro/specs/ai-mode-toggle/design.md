# Design Document: AI Mode Toggle

## Overview

The AI Mode Toggle feature transforms the drawing application between two distinct experiences: a playful, colorful Doodle Mode for casual creative expression, and a dark, hacker-themed AI Mode with real-time drawing analysis. The system uses React state management, CSS theme switching, and integrates with the Gemini API for intelligent feedback.

The design leverages the existing canvas engine architecture while adding new analysis capabilities, theme management, and AI-powered features. The toggle creates a dramatic visual transformation while preserving all drawing data and maintaining smooth performance.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Root                        │
│                    (Mode State Manager)                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────────┬──────────────────────────────┐
             │                 │                              │
      ┌──────▼──────┐   ┌─────▼──────┐            ┌─────────▼────────┐
      │   Theme     │   │   Canvas   │            │   AI Analysis    │
      │   System    │   │   Engine   │            │     Engine       │
      └──────┬──────┘   └─────┬──────┘            └─────────┬────────┘
             │                │                              │
             │                │                              │
      ┌──────▼──────────────────▼──────────────────────────▼─────────┐
      │                    UI Components                              │
      │  - Toggle Switch                                              │
      │  - Drawing Tools                                              │
      │  - Terminal Panels (AI Mode)                                  │
      │  - Personality Quotes (Doodle Mode)                           │
      └───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Mode Toggle**: User clicks toggle → State updates → Theme applies → UI re-renders
2. **Drawing in Doodle Mode**: User draws → Canvas engine renders → Stroke stored
3. **Drawing in AI Mode**: User draws → Canvas engine renders → Analysis engine processes → Metrics update → Terminal panels display
4. **AI Suggestions**: Analysis data → Gemini API request → Response parsed → Terminal panels display

## Components and Interfaces

### 1. Mode State Management

**Interface: ModeState**
```typescript
type DrawingMode = 'doodle' | 'ai';

interface ModeState {
  currentMode: DrawingMode;
  isTransitioning: boolean;
}
```

**Hook: useModeToggle**
```typescript
interface UseModeToggleReturn {
  mode: DrawingMode;
  isTransitioning: boolean;
  toggleMode: () => void;
}

function useModeToggle(): UseModeToggleReturn {
  const [mode, setMode] = useState<DrawingMode>('doodle');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const toggleMode = () => {
    setIsTransitioning(true);
    setMode(prev => prev === 'doodle' ? 'ai' : 'doodle');
    
    // Transition completes after animation
    setTimeout(() => setIsTransitioning(false), 1000);
  };
  
  return { mode, isTransitioning, toggleMode };
}
```

### 2. Theme System

**Interface: ThemeConfig**
```typescript
interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  border: string;
}

interface ThemeConfig {
  mode: DrawingMode;
  colors: ThemeColors;
  fonts: {
    header: string;
    body: string;
  };
  effects: {
    glow: boolean;
    scanlines: boolean;
  };
}

const DOODLE_THEME: ThemeConfig = {
  mode: 'doodle',
  colors: {
    background: '#ffffff',
    text: '#1f2937',
    accent: 'linear-gradient(to right, #9333ea, #ec4899, #f97316)',
    border: '#e5e7eb',
  },
  fonts: {
    header: 'var(--font-pacifico)',
    body: 'var(--font-geist-sans)',
  },
  effects: {
    glow: false,
    scanlines: false,
  },
};

const AI_THEME: ThemeConfig = {
  mode: 'ai',
  colors: {
    background: '#000000',
    text: '#00FF00',
    accent: '#00FF41',
    border: '#00FF00',
  },
  fonts: {
    header: 'var(--font-geist-mono)',
    body: 'var(--font-geist-mono)',
  },
  effects: {
    glow: true,
    scanlines: true,
  },
};
```

**Component: ThemeProvider**
```typescript
function ThemeProvider({ mode, children }: { mode: DrawingMode; children: ReactNode }) {
  const theme = mode === 'doodle' ? DOODLE_THEME : AI_THEME;
  
  useEffect(() => {
    // Apply CSS custom properties
    document.documentElement.style.setProperty('--bg-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
    document.documentElement.style.setProperty('--border-color', theme.colors.border);
    
    // Apply theme class to body
    document.body.className = `theme-${mode}`;
  }, [mode, theme]);
  
  return <>{children}</>;
}
```

### 3. Toggle Switch Component

**Component: ModeToggleSwitch**
```typescript
interface ModeToggleSwitchProps {
  mode: DrawingMode;
  onToggle: () => void;
  disabled?: boolean;
}

function ModeToggleSwitch({ mode, onToggle, disabled }: ModeToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`toggle-switch ${mode}`}
      aria-label={`Switch to ${mode === 'doodle' ? 'AI' : 'Doodle'} mode`}
      aria-pressed={mode === 'ai'}
      role="switch"
    >
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-label">
        {mode === 'doodle' ? '🎨 Doodle' : '🤖 AI'}
      </span>
    </button>
  );
}
```

### 4. Real-Time Analysis Engine

**Interface: StrokeMetrics**
```typescript
interface StrokeMetrics {
  patternType: 'linear' | 'circular' | 'zigzag' | 'random' | 'complex';
  repetitionScore: number; // 0-1, higher = more repetitive
  averageSpeed: number; // pixels per millisecond
  symmetryScore: number; // 0-1, higher = more symmetrical
  complexityScore: number; // 0-1, higher = more complex
  strokeCount: number;
  totalLength: number;
}
```

**Class: AnalysisEngine**
```typescript
class AnalysisEngine {
  private metrics: StrokeMetrics;
  private strokes: Stroke[];
  
  constructor() {
    this.metrics = this.initializeMetrics();
    this.strokes = [];
  }
  
  private initializeMetrics(): StrokeMetrics {
    return {
      patternType: 'random',
      repetitionScore: 0,
      averageSpeed: 0,
      symmetryScore: 0,
      complexityScore: 0,
      strokeCount: 0,
      totalLength: 0,
    };
  }
  
  // Analyze a new stroke and update metrics
  analyzeStroke(stroke: Stroke): StrokeMetrics {
    this.strokes.push(stroke);
    
    // Update metrics
    this.metrics.strokeCount = this.strokes.length;
    this.metrics.totalLength = this.calculateTotalLength();
    this.metrics.averageSpeed = this.calculateAverageSpeed(stroke);
    this.metrics.patternType = this.detectPattern(stroke);
    this.metrics.repetitionScore = this.calculateRepetition();
    this.metrics.symmetryScore = this.calculateSymmetry();
    this.metrics.complexityScore = this.calculateComplexity();
    
    return { ...this.metrics };
  }
  
  private calculateTotalLength(): number {
    return this.strokes.reduce((total, stroke) => {
      return total + this.getStrokeLength(stroke);
    }, 0);
  }
  
  private getStrokeLength(stroke: Stroke): number {
    let length = 0;
    for (let i = 1; i < stroke.points.length; i++) {
      const p1 = stroke.points[i - 1];
      const p2 = stroke.points[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }
  
  private calculateAverageSpeed(stroke: Stroke): number {
    if (stroke.points.length < 2) return 0;
    
    const firstPoint = stroke.points[0];
    const lastPoint = stroke.points[stroke.points.length - 1];
    const timeDiff = lastPoint.timestamp - firstPoint.timestamp;
    
    if (timeDiff === 0) return 0;
    
    const length = this.getStrokeLength(stroke);
    return length / timeDiff;
  }
  
  private detectPattern(stroke: Stroke): 'linear' | 'circular' | 'zigzag' | 'random' | 'complex' {
    if (stroke.points.length < 3) return 'random';
    
    // Calculate direction changes
    let directionChanges = 0;
    let totalAngleChange = 0;
    
    for (let i = 2; i < stroke.points.length; i++) {
      const p1 = stroke.points[i - 2];
      const p2 = stroke.points[i - 1];
      const p3 = stroke.points[i];
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
      
      let angleDiff = angle2 - angle1;
      // Normalize to [-π, π]
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      totalAngleChange += Math.abs(angleDiff);
      
      if (Math.abs(angleDiff) > Math.PI / 4) {
        directionChanges++;
      }
    }
    
    const avgAngleChange = totalAngleChange / (stroke.points.length - 2);
    
    // Classify pattern
    if (avgAngleChange < 0.1) return 'linear';
    if (totalAngleChange > Math.PI * 3 && totalAngleChange < Math.PI * 5) return 'circular';
    if (directionChanges > stroke.points.length / 4) return 'zigzag';
    if (avgAngleChange > 1.0) return 'complex';
    
    return 'random';
  }
  
  private calculateRepetition(): number {
    if (this.strokes.length < 2) return 0;
    
    // Compare recent strokes for similarity
    const recentStrokes = this.strokes.slice(-5);
    let similaritySum = 0;
    let comparisons = 0;
    
    for (let i = 0; i < recentStrokes.length - 1; i++) {
      for (let j = i + 1; j < recentStrokes.length; j++) {
        similaritySum += this.calculateStrokeSimilarity(recentStrokes[i], recentStrokes[j]);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? similaritySum / comparisons : 0;
  }
  
  private calculateStrokeSimilarity(stroke1: Stroke, stroke2: Stroke): number {
    // Simple similarity based on length and pattern
    const length1 = this.getStrokeLength(stroke1);
    const length2 = this.getStrokeLength(stroke2);
    
    const lengthSimilarity = 1 - Math.abs(length1 - length2) / Math.max(length1, length2);
    
    // Pattern similarity
    const pattern1 = this.detectPattern(stroke1);
    const pattern2 = this.detectPattern(stroke2);
    const patternSimilarity = pattern1 === pattern2 ? 1 : 0;
    
    return (lengthSimilarity + patternSimilarity) / 2;
  }
  
  private calculateSymmetry(): number {
    if (this.strokes.length === 0) return 0;
    
    // Calculate bounding box center
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    this.strokes.forEach(stroke => {
      stroke.points.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      });
    });
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Check vertical and horizontal symmetry
    let verticalSymmetry = 0;
    let horizontalSymmetry = 0;
    let totalPoints = 0;
    
    this.strokes.forEach(stroke => {
      stroke.points.forEach(point => {
        const mirrorX = 2 * centerX - point.x;
        const mirrorY = 2 * centerY - point.y;
        
        // Check if mirrored point exists nearby
        const hasVerticalMirror = this.hasPointNearby(mirrorX, point.y, 10);
        const hasHorizontalMirror = this.hasPointNearby(point.x, mirrorY, 10);
        
        if (hasVerticalMirror) verticalSymmetry++;
        if (hasHorizontalMirror) horizontalSymmetry++;
        totalPoints++;
      });
    });
    
    const vSymScore = totalPoints > 0 ? verticalSymmetry / totalPoints : 0;
    const hSymScore = totalPoints > 0 ? horizontalSymmetry / totalPoints : 0;
    
    return Math.max(vSymScore, hSymScore);
  }
  
  private hasPointNearby(x: number, y: number, threshold: number): boolean {
    return this.strokes.some(stroke =>
      stroke.points.some(point => {
        const dx = point.x - x;
        const dy = point.y - y;
        return Math.sqrt(dx * dx + dy * dy) < threshold;
      })
    );
  }
  
  private calculateComplexity(): number {
    if (this.strokes.length === 0) return 0;
    
    // Complexity based on:
    // - Number of strokes
    // - Total length
    // - Direction changes
    // - Pattern variety
    
    const strokeComplexity = Math.min(this.strokes.length / 50, 1);
    const lengthComplexity = Math.min(this.metrics.totalLength / 10000, 1);
    
    // Pattern variety
    const patterns = new Set(this.strokes.map(s => this.detectPattern(s)));
    const varietyComplexity = patterns.size / 5; // 5 possible patterns
    
    return (strokeComplexity + lengthComplexity + varietyComplexity) / 3;
  }
  
  getMetrics(): StrokeMetrics {
    return { ...this.metrics };
  }
  
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.strokes = [];
  }
}
```

### 5. Terminal Panel Components

**Component: TerminalPanel**
```typescript
interface TerminalPanelProps {
  title: string;
  children: ReactNode;
}

function TerminalPanel({ title, children }: TerminalPanelProps) {
  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <span className="terminal-prompt">$</span>
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-content">
        {children}
      </div>
    </div>
  );
}
```

**Component: MetricsDisplay**
```typescript
interface MetricsDisplayProps {
  metrics: StrokeMetrics;
}

function MetricsDisplay({ metrics }: MetricsDisplayProps) {
  return (
    <TerminalPanel title="ANALYSIS_METRICS">
      <div className="metrics-grid">
        <MetricRow label="PATTERN" value={metrics.patternType.toUpperCase()} />
        <MetricRow label="STROKES" value={metrics.strokeCount.toString()} />
        <MetricRow label="SPEED" value={`${metrics.averageSpeed.toFixed(2)} px/ms`} />
        <MetricRow label="REPETITION" value={`${(metrics.repetitionScore * 100).toFixed(0)}%`} />
        <MetricRow label="SYMMETRY" value={`${(metrics.symmetryScore * 100).toFixed(0)}%`} />
        <MetricRow label="COMPLEXITY" value={`${(metrics.complexityScore * 100).toFixed(0)}%`} />
      </div>
    </TerminalPanel>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-row">
      <span className="metric-label">{label}:</span>
      <span className="metric-value">{value}</span>
      <span className="metric-cursor">_</span>
    </div>
  );
}
```

### 6. Gemini API Integration

**Interface: GeminiRequest**
```typescript
interface GeminiRequest {
  metrics: StrokeMetrics;
  requestType: 'suggestion' | 'exercise' | 'analysis';
}

interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
}
```

**Service: GeminiService**
```typescript
class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  private cache: Map<string, { response: string; timestamp: number }>;
  private rateLimiter: RateLimiter;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.cache = new Map();
    this.rateLimiter = new RateLimiter(10, 60000); // 10 requests per minute
  }
  
  async getSuggestion(metrics: StrokeMetrics): Promise<GeminiResponse> {
    // Check rate limit
    if (!this.rateLimiter.canMakeRequest()) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait before requesting more suggestions.',
      };
    }
    
    // Check cache
    const cacheKey = this.getCacheKey('suggestion', metrics);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return { success: true, content: cached.response };
    }
    
    const prompt = this.buildSuggestionPrompt(metrics);
    
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Cache response
      this.cache.set(cacheKey, { response: content, timestamp: Date.now() });
      this.rateLimiter.recordRequest();
      
      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async getExercise(metrics: StrokeMetrics): Promise<GeminiResponse> {
    if (!this.rateLimiter.canMakeRequest()) {
      return {
        success: false,
        error: 'Rate limit exceeded.',
      };
    }
    
    const cacheKey = this.getCacheKey('exercise', metrics);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 600000) { // 10 minute cache
      return { success: true, content: cached.response };
    }
    
    const prompt = this.buildExercisePrompt(metrics);
    
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      this.cache.set(cacheKey, { response: content, timestamp: Date.now() });
      this.rateLimiter.recordRequest();
      
      return { success: true, content };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  private buildSuggestionPrompt(metrics: StrokeMetrics): string {
    return `You are an AI drawing coach analyzing real-time drawing patterns. Based on these metrics, provide a brief, encouraging suggestion (2-3 sentences max) in a hacker/terminal style:

Pattern: ${metrics.patternType}
Strokes: ${metrics.strokeCount}
Speed: ${metrics.averageSpeed.toFixed(2)} px/ms
Repetition: ${(metrics.repetitionScore * 100).toFixed(0)}%
Symmetry: ${(metrics.symmetryScore * 100).toFixed(0)}%
Complexity: ${(metrics.complexityScore * 100).toFixed(0)}%

Format your response like terminal output with "> " prefix. Be concise and technical.`;
  }
  
  private buildExercisePrompt(metrics: StrokeMetrics): string {
    return `You are an AI drawing coach. Based on these drawing metrics, suggest a specific drawing exercise (3-4 sentences) to help improve their skills. Use hacker/terminal style language:

Pattern: ${metrics.patternType}
Strokes: ${metrics.strokeCount}
Complexity: ${(metrics.complexityScore * 100).toFixed(0)}%
Symmetry: ${(metrics.symmetryScore * 100).toFixed(0)}%

Format as terminal output with "> " prefix. Be specific and actionable.`;
  }
  
  private getCacheKey(type: string, metrics: StrokeMetrics): string {
    return `${type}-${metrics.patternType}-${Math.floor(metrics.strokeCount / 10)}-${Math.floor(metrics.complexityScore * 10)}`;
  }
}

class RateLimiter {
  private requests: number[];
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number, windowMs: number) {
    this.requests = [];
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
}
```

## Data Models

### Stroke (Existing)
```typescript
interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  baseWidth: number;
  brushType: string;
}
```

### Mode Configuration
```typescript
interface ModeConfig {
  mode: DrawingMode;
  theme: ThemeConfig;
  analysisEnabled: boolean;
  aiSuggestionsEnabled: boolean;
}
```

### Analysis State
```typescript
interface AnalysisState {
  metrics: StrokeMetrics;
  lastUpdate: number;
  suggestions: string[];
  exercises: string[];
  isAnalyzing: boolean;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Mode Toggle Bidirectionality

*For any* current mode state, toggling the mode switch should transition to the opposite mode, and toggling again should return to the original mode.

**Validates: Requirements 1.2**

### Property 2: State Preservation During Mode Switching

*For any* drawing data, canvas state, and tool settings, switching between modes should preserve all state without loss or modification.

**Validates: Requirements 1.3, 7.2, 7.3**

### Property 3: Mode Transition Performance

*For any* mode switch operation, the transition should complete within 1000ms.

**Validates: Requirements 1.4**

### Property 4: Mode Persistence

*For any* mode state, the application should maintain that mode until an explicit toggle action occurs.

**Validates: Requirements 1.5**

### Property 5: Pattern Detection Consistency

*For any* stroke with at least 3 points, the Analysis Engine should classify it into exactly one pattern type (linear, circular, zigzag, random, or complex).

**Validates: Requirements 4.1**

### Property 6: Repetition Score Bounds

*For any* set of strokes, the repetition score calculated by the Analysis Engine should be between 0 and 1 inclusive.

**Validates: Requirements 4.2**

### Property 7: Speed Calculation Non-Negativity

*For any* stroke with timestamps, the calculated drawing speed should be non-negative.

**Validates: Requirements 4.3**

### Property 8: Symmetry Score Bounds

*For any* set of strokes, the symmetry score calculated by the Analysis Engine should be between 0 and 1 inclusive.

**Validates: Requirements 4.4**

### Property 9: Complexity Score Bounds

*For any* set of strokes, the complexity score calculated by the Analysis Engine should be between 0 and 1 inclusive.

**Validates: Requirements 4.5**

### Property 10: Analysis Performance

*For any* stroke completion in AI Mode, the Analysis Engine should update metrics within 100ms.

**Validates: Requirements 4.7**

### Property 11: API Error Handling

*For any* Gemini API request failure, the application should display an error message and continue functioning without crashing.

**Validates: Requirements 5.6**

### Property 12: Terminal Panel Performance

*For any* metrics update in AI Mode, updating Terminal Panels should not cause frame rate to drop below 30 FPS.

**Validates: Requirements 6.4**

### Property 13: Frame Rate Maintenance

*For any* stroke processing in AI Mode, the Analysis Engine should not cause frame rate to drop below 30 FPS.

**Validates: Requirements 7.1**

### Property 14: Theme Application Completeness

*For any* UI component, switching themes should update its styling to match the new theme.

**Validates: Requirements 8.4**

### Property 15: API Response Parsing

*For any* valid Gemini API response, the application should successfully parse and display the content in Terminal Panels.

**Validates: Requirements 9.4**

### Property 16: Rate Limiting Enforcement

*For any* sequence of API requests, the rate limiter should prevent exceeding the configured limit (10 requests per minute).

**Validates: Requirements 9.5**

### Property 17: Cache Hit Efficiency

*For any* identical API request made within the cache window (5 minutes for suggestions, 10 minutes for exercises), the cached response should be returned without making a new API call.

**Validates: Requirements 9.6**

## Error Handling

### Mode Switching Errors

**Scenario**: Transition animation fails or is interrupted
- **Handling**: Reset transition state, ensure mode state is consistent
- **User Feedback**: Complete transition immediately without animation
- **Recovery**: Application remains functional in target mode

**Scenario**: State preservation fails during mode switch
- **Handling**: Attempt to restore from last known good state
- **User Feedback**: Display warning message about potential data loss
- **Recovery**: Allow user to undo mode switch

### Analysis Engine Errors

**Scenario**: Invalid stroke data (empty points array, missing timestamps)
- **Handling**: Skip analysis for invalid stroke, log warning
- **User Feedback**: No visible error (graceful degradation)
- **Recovery**: Continue analyzing subsequent strokes

**Scenario**: Analysis computation exceeds performance budget
- **Handling**: Throttle analysis updates, skip intermediate strokes
- **User Feedback**: Metrics update less frequently
- **Recovery**: Resume normal analysis when performance improves

**Scenario**: Metrics calculation produces NaN or Infinity
- **Handling**: Clamp to valid range [0, 1], use default value
- **User Feedback**: Display fallback metric value
- **Recovery**: Recalculate on next stroke

### Gemini API Errors

**Scenario**: Network request fails (timeout, no connection)
- **Handling**: Return cached response if available, otherwise show error
- **User Feedback**: Display "Connection error. Using cached suggestions." or "Unable to fetch suggestions. Please check your connection."
- **Recovery**: Retry on next request, continue with local analysis

**Scenario**: API rate limit exceeded
- **Handling**: Queue request for later, show rate limit message
- **User Feedback**: "Rate limit reached. Suggestions will resume shortly."
- **Recovery**: Process queued requests after rate limit window expires

**Scenario**: API returns invalid or malformed response
- **Handling**: Log error, use fallback generic suggestion
- **User Feedback**: Display generic encouragement message
- **Recovery**: Retry with next request

**Scenario**: API key invalid or missing
- **Handling**: Disable AI suggestions feature, show configuration error
- **User Feedback**: "AI suggestions unavailable. Please configure API key."
- **Recovery**: Allow user to configure API key in settings

### Theme System Errors

**Scenario**: CSS custom properties fail to apply
- **Handling**: Fall back to inline styles
- **User Feedback**: Theme may appear slightly different
- **Recovery**: Reapply theme on next mode switch

**Scenario**: Font loading fails
- **Handling**: Use system fallback fonts
- **User Feedback**: Text appears in fallback font
- **Recovery**: Retry font loading on page refresh

### Performance Degradation

**Scenario**: Frame rate drops below 30 FPS during analysis
- **Handling**: Reduce analysis frequency, skip non-critical calculations
- **User Feedback**: Metrics update less frequently
- **Recovery**: Resume full analysis when performance improves

**Scenario**: Memory usage exceeds threshold
- **Handling**: Clear old cached data, limit stroke history
- **User Feedback**: No visible change
- **Recovery**: Garbage collection frees memory

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, UI interactions, and integration points
- **Property tests**: Verify universal properties across all inputs with randomized data

### Unit Testing Focus

Unit tests should cover:
- Specific mode switching scenarios (doodle → AI, AI → doodle)
- UI component rendering in each mode
- Theme application for specific elements
- API integration with mocked responses
- Error handling for specific failure cases
- Accessibility features (keyboard navigation, ARIA attributes)
- Edge cases (empty strokes, single-point strokes, rapid toggling)

### Property-Based Testing Focus

Property tests should cover:
- Mode toggle bidirectionality with random initial states
- State preservation with randomly generated drawing data
- Analysis engine metrics with randomly generated strokes
- Performance requirements with varying stroke complexities
- Rate limiting with random request patterns
- Cache behavior with random request sequences

### Property Test Configuration

- **Library**: fast-check (for TypeScript/JavaScript)
- **Iterations**: Minimum 100 runs per property test
- **Tagging**: Each property test must reference its design document property
- **Tag format**: `// Feature: ai-mode-toggle, Property {number}: {property_text}`

### Test Organization

```
tests/
├── unit/
│   ├── mode-toggle.test.ts
│   ├── theme-system.test.ts
│   ├── analysis-engine.test.ts
│   ├── gemini-service.test.ts
│   └── components/
│       ├── ModeToggleSwitch.test.tsx
│       ├── TerminalPanel.test.tsx
│       └── MetricsDisplay.test.tsx
├── property/
│   ├── mode-switching.property.test.ts
│   ├── analysis-metrics.property.test.ts
│   ├── api-integration.property.test.ts
│   └── performance.property.test.ts
└── integration/
    ├── mode-switching-flow.test.ts
    └── ai-analysis-flow.test.ts
```

### Example Property Test

```typescript
// Feature: ai-mode-toggle, Property 2: State Preservation During Mode Switching
import fc from 'fast-check';

describe('Property: State Preservation During Mode Switching', () => {
  it('should preserve all drawing data when switching modes', () => {
    fc.assert(
      fc.property(
        fc.array(strokeArbitrary, { minLength: 0, maxLength: 100 }),
        fc.record({
          color: fc.hexaString({ minLength: 6, maxLength: 6 }),
          brushType: fc.constantFrom('ink', 'marker', 'pencil', 'eraser'),
          width: fc.integer({ min: 1, max: 50 }),
        }),
        (strokes, toolSettings) => {
          const initialState = { strokes, toolSettings };
          
          // Switch to AI mode
          const afterAISwitch = switchMode(initialState, 'ai');
          
          // Switch back to Doodle mode
          const afterDoodleSwitch = switchMode(afterAISwitch, 'doodle');
          
          // Verify state is preserved
          expect(afterDoodleSwitch.strokes).toEqual(initialState.strokes);
          expect(afterDoodleSwitch.toolSettings).toEqual(initialState.toolSettings);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Performance Testing

Performance tests should measure:
- Mode transition time (target: < 1000ms)
- Analysis engine processing time per stroke (target: < 100ms)
- Frame rate during analysis (target: ≥ 30 FPS)
- Terminal panel update time (target: < 16ms for 60 FPS)

### Accessibility Testing

Accessibility tests should verify:
- Keyboard navigation (Tab, Enter, Space)
- Screen reader announcements (ARIA labels, live regions)
- Color contrast ratios (WCAG AA minimum: 4.5:1 for normal text)
- Focus indicators visibility

### Integration Testing

Integration tests should cover:
- Complete mode switching flow with drawing
- AI analysis pipeline from stroke to display
- Gemini API integration with real API calls (in staging)
- Theme system integration with all components
