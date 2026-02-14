interface FillButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export default function FillButton({ onClick, isActive }: FillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold transition shadow-md text-sm sm:text-base ${
        isActive
          ? 'bg-green-500 hover:bg-green-600 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      }`}
    >
      🪣 {isActive ? 'Click to Fill' : 'Fill'}
    </button>
  );
}
