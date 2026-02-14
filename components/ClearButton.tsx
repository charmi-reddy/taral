interface ClearButtonProps {
  onClick: () => void;
}

export default function ClearButton({ onClick }: ClearButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold transition shadow-md text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white"
    >
      Clear
    </button>
  );
}
