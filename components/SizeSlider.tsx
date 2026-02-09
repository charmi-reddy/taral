import type { Theme } from './ThemeToggle';

interface SizeSliderProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
  theme: Theme;
}

export default function SizeSlider({ 
  value, 
  onChange, 
  min = 1, 
  max = 50,
  theme
}: SizeSliderProps) {
  const getSliderColor = () => {
    switch (theme) {
      case 'dark':
        return '#60a5fa'; // blue-400
      case 'purple':
        return '#c084fc'; // purple-400
      default:
        return '#3b82f6'; // blue-500
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Size: <span className="text-lg font-bold">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${getSliderColor()} 0%, ${getSliderColor()} ${((value - min) / (max - min)) * 100}%, ${theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.2)'} ${((value - min) / (max - min)) * 100}%, ${theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.2)'} 100%)`
        }}
      />
    </div>
  );
}
