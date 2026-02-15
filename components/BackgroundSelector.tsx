import type { BackgroundStyle } from '@/lib/types';

interface BackgroundSelectorProps {
  value: BackgroundStyle;
  onChange: (style: BackgroundStyle) => void;
}

export default function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Background</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BackgroundStyle)}
        className="w-full px-3 py-2 rounded-lg font-medium bg-white text-gray-900 border-2 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:outline-none transition"
      >
        <option value="plain">Plain</option>
        <option value="ruled">Ruled</option>
        <option value="dotted">Dotted</option>
        <option value="grid">Grid</option>
      </select>
    </div>
  );
}
