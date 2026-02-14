import type { CanvasConfig, BrushType, BackgroundStyle } from '@/lib/types';
import ColorPicker from './ColorPicker';
import BrushSelector from './BrushSelector';
import SizeSlider from './SizeSlider';
import BackgroundSelector from './BackgroundSelector';
import ClearButton from './ClearButton';
import FillButton from './FillButton';
import EraseButton from './EraseButton';

interface ControlsProps {
  config: CanvasConfig;
  onColorChange: (color: string) => void;
  onBrushTypeChange: (type: BrushType) => void;
  onBrushSizeChange: (size: number) => void;
  onBackgroundChange: (style: BackgroundStyle) => void;
  onClear: () => void;
  onFill: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function Controls({
  config,
  onColorChange,
  onBrushTypeChange,
  onBrushSizeChange,
  onBackgroundChange,
  onClear,
  onFill,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ControlsProps) {
  const handleEraseClick = () => {
    if (config.brushType === 'eraser') {
      // Switch back to ink if already erasing
      onBrushTypeChange('ink');
    } else {
      // Switch to eraser
      onBrushTypeChange('eraser');
    }
  };

  return (
    <div className="absolute top-4 left-4 rounded-xl shadow-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 z-10 border-2 bg-white text-gray-900 border-gray-200 w-[90vw] sm:w-auto sm:min-w-[240px] max-w-[280px]">
      <div className="border-b border-gray-200 pb-2 sm:pb-3 mb-2 sm:mb-3">
        <h2 className="text-base sm:text-lg font-bold">🎨 Drawing Tools</h2>
      </div>
      
      {/* Undo/Redo buttons */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 px-3 py-2 rounded-lg font-bold transition text-sm ${
            canUndo
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          ↶ Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex-1 px-3 py-2 rounded-lg font-bold transition text-sm ${
            canRedo
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          ↷ Redo
        </button>
      </div>
      
      <ColorPicker value={config.color} onChange={onColorChange} />
      <BrushSelector value={config.brushType} onChange={onBrushTypeChange} />
      <SizeSlider value={config.brushSize} onChange={onBrushSizeChange} />
      <BackgroundSelector value={config.backgroundStyle} onChange={onBackgroundChange} />
      
      {/* Erase button */}
      <EraseButton 
        onClick={handleEraseClick} 
        isActive={config.brushType === 'eraser'}
      />
      
      {/* Fill and Clear buttons */}
      <div className="flex gap-2">
        <div className="flex-1">
          <FillButton onClick={onFill} />
        </div>
        <div className="flex-1">
          <ClearButton onClick={onClear} />
        </div>
      </div>
    </div>
  );
}

