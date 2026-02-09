import type { Theme } from './ThemeToggle';

interface FillButtonProps {
  onClick: () => void;
  theme: Theme;
}

export default function FillButton({ onClick, theme }: FillButtonProps) {
  const getButtonStyles = () => {
    switch (theme) {
      case 'dark':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold transition shadow-md text-sm sm:text-base ${getButtonStyles()}`}
    >
      🪣 Fill
    </button>
  );
}
