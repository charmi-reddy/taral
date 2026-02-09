import type { BrushType } from '@/lib/types';
import type { Theme } from './ThemeToggle';

interface BrushSelectorProps {
  value: BrushType;
  onChange: (type: BrushType) => void;
  theme: Theme;
}

export default function BrushSelector({ value, onChange, theme }: BrushSelectorProps) {
  const getSelectStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-800 text-white border-gray-600';
      case 'purple':
        return 'bg-purple-800 text-white border-purple-600';
      default:
        return 'bg-white text-gray-900 border-gray-300';
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Brush Type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BrushType)}
        className={`w-full px-3 py-2 rounded-lg font-medium ${getSelectStyles()}`}
      >
        <option value="ink">✒️ Ink Pen</option>
        <option value="marker">🖍️ Marker</option>
        <option value="pencil">✏️ Pencil</option>
        <option value="pixel">🎮 Pixel Pen</option>
        <option value="eraser">🧹 Eraser</option>
      </select>
    </div>
  );
}
