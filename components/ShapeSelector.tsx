import type { ShapeType } from '@/lib/types';

interface ShapeSelectorProps {
  value: ShapeType;
  onChange: (type: ShapeType) => void;
}

export default function ShapeSelector({ value, onChange }: ShapeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Shape</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ShapeType)}
        className="w-full px-3 py-2 rounded-lg font-medium bg-white text-gray-900 border-gray-300"
      >
        <option value="circle">⭕ Circle</option>
        <option value="rectangle">▭ Rectangle</option>
        <option value="star">⭐ Star</option>
        <option value="triangle">△ Triangle</option>
        <option value="line">─ Line</option>
        <option value="arrow">→ Arrow</option>
      </select>
    </div>
  );
}
