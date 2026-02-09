import type { BackgroundStyle } from '@/lib/types';

interface BackgroundSelectorProps {
  value: BackgroundStyle;
  onChange: (style: BackgroundStyle) => void;
}

export default function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Background</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BackgroundStyle)}
        className="w-full px-2 py-1 border rounded"
      >
        <option value="plain">Plain</option>
        <option value="ruled">Ruled</option>
        <option value="dotted">Dotted</option>
        <option value="grid">Grid</option>
      </select>
    </div>
  );
}
