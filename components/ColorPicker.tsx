import type { Theme } from './ThemeToggle';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  theme: Theme;
}

export default function ColorPicker({ value, onChange, theme }: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">Color</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-lg cursor-pointer border-2"
        style={{ borderColor: theme === 'light' ? '#d1d5db' : 'rgba(255,255,255,0.2)' }}
      />
    </div>
  );
}
