import type { BrushType } from '@/lib/types';

interface BrushSelectorProps {
  value: BrushType;
  onChange: (type: BrushType) => void;
  disabled?: boolean;
}

export default function BrushSelector({ value, onChange, disabled }: BrushSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Brush Type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BrushType)}
        disabled={disabled}
        className={`w-full px-3 py-2 rounded-lg font-medium border-2 transition ${
          disabled 
            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed' 
            : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:outline-none'
        }`}
      >
        <option value="ink">✒️ Ink Pen</option>
        <option value="pixel">🎮 Pixel Pen</option>
        <option value="spray">🎨 Spray Paint</option>
        <option value="pencil">✏️ Pencil</option>
        <option value="rainbow">🌈 Rainbow</option>
        <option value="glitter">✨ Glitter</option>
        <option value="watercolor">💧 Watercolor</option>
        <option value="neon">💡 Neon</option>
        <option value="eraser">🧹 Eraser</option>
      </select>
    </div>
  );
}
