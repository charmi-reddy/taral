'use client';

import { DrawingMode } from '@/lib/mode-toggle/types';

interface ModeToggleSwitchProps {
  mode: DrawingMode;
  onToggle: () => void;
  disabled?: boolean;
}

export default function ModeToggleSwitch({ mode, onToggle, disabled }: ModeToggleSwitchProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`mode-toggle-switch ${mode}`}
      aria-label={`Switch to ${mode === 'doodle' ? 'AI' : 'Doodle'} mode`}
      aria-pressed={mode === 'ai'}
      role="switch"
      tabIndex={0}
    >
      <div className="toggle-track">
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-label">
        {mode === 'doodle' ? '🎨 Doodle' : '🤖 AI'}
      </span>
    </button>
  );
}
