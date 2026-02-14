import type { BrushType } from '@/lib/types';

interface BrushSelectorProps {
  value: BrushType;
  onChange: (type: BrushType) => void;
}

export default function BrushSelector({ value, onChange }: BrushSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Brush Type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BrushType)}
        className="w-full px-3 py-2 rounded-lg font-medium bg-white text-gray-900 border-gray-300"
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
