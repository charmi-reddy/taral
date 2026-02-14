import type { DrawMode } from '@/lib/types';

interface ModeToggleProps {
  mode: DrawMode;
  onModeChange: (mode: DrawMode) => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onModeChange('freehand')}
        className={`flex-1 px-3 py-2 rounded-lg font-bold transition text-sm ${
          mode === 'freehand'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        ✏️ Draw
      </button>
      <button
        onClick={() => onModeChange('shape')}
        className={`flex-1 px-3 py-2 rounded-lg font-bold transition text-sm ${
          mode === 'shape'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        ⬜ Shapes
      </button>
    </div>
  );
}
