interface ClearButtonProps {
  onClick: () => void;
}

export default function ClearButton({ onClick }: ClearButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
    >
      Clear Canvas
    </button>
  );
}
