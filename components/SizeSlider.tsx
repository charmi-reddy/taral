interface SizeSliderProps {
  value: number;
  onChange: (size: number) => void;
  min?: number;
  max?: number;
}

export default function SizeSlider({ 
  value, 
  onChange, 
  min = 1, 
  max = 50 
}: SizeSliderProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Size: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
