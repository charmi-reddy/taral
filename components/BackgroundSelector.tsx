import type { BackgroundStyle } from '@/lib/types';
import type { Theme } from './ThemeToggle';

interface BackgroundSelectorProps {
  value: BackgroundStyle;
  onChange: (style: BackgroundStyle) => void;
  theme: Theme;
}

export default function BackgroundSelector({ value, onChange, theme }: BackgroundSelectorProps) {
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
      <label className="block text-sm font-semibold mb-2">Background</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BackgroundStyle)}
        className={`w-full px-3 py-2 rounded-lg font-medium ${getSelectStyles()}`}
      >
        <option value="plain">📄 Plain</option>
        <option value="ruled">📝 Ruled</option>
        <option value="dotted">⚫ Dotted</option>
        <option value="grid">🎨 Grid</option>
      </select>
    </div>
  );
}
