import type { CanvasConfig, BrushType, BackgroundStyle } from '@/lib/types';
import ColorPicker from './ColorPicker';
import BrushSelector from './BrushSelector';
import SizeSlider from './SizeSlider';
import BackgroundSelector from './BackgroundSelector';
import ClearButton from './ClearButton';
import ThemeToggle, { Theme } from './ThemeToggle';

interface ControlsProps {
  config: CanvasConfig;
  theme: Theme;
  onColorChange: (color: string) => void;
  onBrushTypeChange: (type: BrushType) => void;
  onBrushSizeChange: (size: number) => void;
  onBackgroundChange: (style: BackgroundStyle) => void;
  onThemeChange: (theme: Theme) => void;
  onClear: () => void;
}

export default function Controls({
  config,
  theme,
  onColorChange,
  onBrushTypeChange,
  onBrushSizeChange,
  onBackgroundChange,
  onThemeChange,
  onClear,
}: ControlsProps) {
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white border-gray-700';
      case 'purple':
        return 'bg-purple-900 text-white border-purple-700';
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  };

  return (
    <div className={`absolute top-4 left-4 rounded-xl shadow-2xl p-5 space-y-4 z-10 border-2 ${getThemeStyles()} min-w-[240px]`}>
      <div className="border-b pb-3 mb-3" style={{ borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
        <h2 className="text-lg font-bold mb-2">🎨 Drawing Tools</h2>
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>
      
      <ColorPicker value={config.color} onChange={onColorChange} theme={theme} />
      <BrushSelector value={config.brushType} onChange={onBrushTypeChange} theme={theme} />
      <SizeSlider value={config.brushSize} onChange={onBrushSizeChange} theme={theme} />
      <BackgroundSelector value={config.backgroundStyle} onChange={onBackgroundChange} theme={theme} />
      <ClearButton onClick={onClear} theme={theme} />
    </div>
  );
}
