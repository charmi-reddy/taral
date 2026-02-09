# Doodle Canvas Project Structure

## Directory Layout

```
taral/
├── app/                    # Next.js app directory
│   ├── fonts/             # Font files
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   └── .gitkeep
├── hooks/                 # Custom React hooks
│   └── .gitkeep
├── lib/                   # Core library code
│   ├── types.ts          # TypeScript type definitions
│   └── types.test.ts     # Type definition tests
├── docs/                  # Specification documents
│   ├── requirements.md   # Requirements document
│   ├── design.md         # Design document
│   └── tasks.md          # Implementation tasks
└── vitest.config.ts      # Vitest configuration
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Testing**: Vitest + fast-check (property-based testing)
- **Canvas API**: HTML5 Canvas 2D Context

## Core Types Defined

- `BrushType`: 'ink' | 'marker' | 'pencil' | 'pixel'
- `BackgroundStyle`: 'plain' | 'ruled' | 'dotted' | 'grid'
- `Point`: { x, y, pressure?, timestamp }
- `Stroke`: { points, color, brushType, baseWidth }
- `CanvasConfig`: { color, brushType, brushSize, backgroundStyle }
- `CanvasState`: { isDrawing, currentStroke, strokes, config }

## Testing Setup

- **Framework**: Vitest with jsdom environment
- **Property Testing**: fast-check library
- **Component Testing**: @testing-library/react

### Test Commands

```bash
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:ui   # Open Vitest UI
```

## Next Steps

Follow the implementation tasks in `docs/tasks.md` to build the doodle canvas application.
