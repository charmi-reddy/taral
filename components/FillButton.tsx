interface FillButtonProps {
  onClick: () => void;
}

export default function FillButton({ onClick }: FillButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-bold transition shadow-md text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white"
    >
      Fill
    </button>
  );
}
