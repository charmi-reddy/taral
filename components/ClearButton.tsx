import type { Theme } from './ThemeToggle';

interface ClearButtonProps {
  onClick: () => void;
  theme: Theme;
}

export default function ClearButton({ onClick, theme }: ClearButtonProps) {
  const getButtonStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'purple':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-red-500 hover:bg-red-600 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-lg font-bold transition shadow-md ${getButtonStyles()}`}
    >
      🗑️ Clear Canvas
    </button>
  );
}
