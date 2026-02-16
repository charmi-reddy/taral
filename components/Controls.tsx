import { useState } from 'react';
import type { CanvasConfig, BrushType, BackgroundStyle } from '@/lib/types';
import ColorPicker from './ColorPicker';
import BrushSelector from './BrushSelector';
import SizeSlider from './SizeSlider';
import BackgroundSelector from './BackgroundSelector';
import ClearButton from './ClearButton';
import FillButton from './FillButton';

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
  isFillMode: boolean;
  onHomeClick?: () => void;
  onSave?: () => void;
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
  isFillMode,
  onHomeClick,
  onSave,
}: ControlsProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  
  const handleSaveClick = () => {
    if (onSave) {
      onSave();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  return (
    <div className="absolute top-4 left-4 rounded-xl shadow-2xl z-30 border-2 bg-white text-gray-900 border-gray-200 w-[90vw] sm:w-auto sm:min-w-[240px] max-w-[280px]">
      {/* Minimize/Expand button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-3 top-3 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition z-40"
        title={isMinimized ? "Expand tools" : "Minimize tools"}
      >
        {isMinimized ? '▶' : '◀'}
      </button>
      
      {!isMinimized && (
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          {/* Home button */}
          {onHomeClick && (
            <button
              onClick={onHomeClick}
              className="w-full px-3 py-2 rounded-lg font-bold transition text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center gap-2"
            >
              <span>Home</span>
            </button>
          )}
          
          {/* Save button */}
          {onSave && (
            <button
              onClick={handleSaveClick}
              className="w-full px-3 py-2 rounded-lg font-bold transition text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2 shadow-md"
            >
              <span>{showSaved ? 'Saved!' : 'Save Progress'}</span>
            </button>
          )}
          
          <div className="border-b border-gray-200 pb-2 sm:pb-3 mb-2 sm:mb-3">
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-pacifico)' }}>Drawing Tools</h2>
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
          <BrushSelector value={config.brushType} onChange={onBrushTypeChange} disabled={isFillMode} />
          <SizeSlider value={config.brushSize} onChange={onBrushSizeChange} />
          <BackgroundSelector value={config.backgroundStyle} onChange={onBackgroundChange} />
          
          {/* Fill and Clear buttons */}
          <div className="flex gap-2">
            <div className="flex-1">
              <FillButton onClick={onFill} isActive={isFillMode} />
            </div>
            <div className="flex-1">
              <ClearButton onClick={onClear} />
            </div>
          </div>
        </div>
      )}
      
      {isMinimized && (
        <div className="p-3 flex items-center justify-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">Tools</span>
        </div>
      )}
    </div>
  );
}

