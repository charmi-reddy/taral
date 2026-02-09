'use client';

export type Theme = 'light' | 'dark' | 'purple';

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeToggle({ theme, onThemeChange }: ThemeToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onThemeChange('light')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          theme === 'light'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="Light Theme"
      >
        ☀️
      </button>
      <button
        onClick={() => onThemeChange('dark')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="Dark Theme"
      >
        🌙
      </button>
      <button
        onClick={() => onThemeChange('purple')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition ${
          theme === 'purple'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="Purple Theme"
      >
        💜
      </button>
    </div>
  );
}
