interface EraseButtonProps {
  onClick: () => void;
  isActive: boolean;
}

export default function EraseButton({ onClick, isActive }: EraseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold transition shadow-md text-sm sm:text-base ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      🧹 Erase
    </button>
  );
}
