import type { BrushType } from '@/lib/types';

interface BrushSelectorProps {
  value: BrushType;
  onChange: (type: BrushType) => void;
}

export default function BrushSelector({ value, onChange }: BrushSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Brush Type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BrushType)}
        className="w-full px-2 py-1 border rounded"
      >
        <option value="ink">Ink Pen</option>
        <option value="marker">Marker</option>
        <option value="pencil">Pencil</option>
        <option value="pixel">Pixel Pen</option>
      </select>
    </div>
  );
}
