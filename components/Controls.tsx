import type { CanvasConfig, BrushType, BackgroundStyle } from '@/lib/types';
import ColorPicker from './ColorPicker';
import BrushSelector from './BrushSelector';
import SizeSlider from './SizeSlider';
import BackgroundSelector from './BackgroundSelector';
import ClearButton from './ClearButton';

interface ControlsProps {
  config: CanvasConfig;
  onColorChange: (color: string) => void;
  onBrushTypeChange: (type: BrushType) => void;
  onBrushSizeChange: (size: number) => void;
  onBackgroundChange: (style: BackgroundStyle) => void;
  onClear: () => void;
}

export default function Controls({
  config,
  onColorChange,
  onBrushTypeChange,
  onBrushSizeChange,
  onBackgroundChange,
  onClear,
}: ControlsProps) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 space-y-3 z-10">
      <ColorPicker value={config.color} onChange={onColorChange} />
      <BrushSelector value={config.brushType} onChange={onBrushTypeChange} />
      <SizeSlider value={config.brushSize} onChange={onBrushSizeChange} />
      <BackgroundSelector value={config.backgroundStyle} onChange={onBackgroundChange} />
      <ClearButton onClick={onClear} />
    </div>
  );
}
