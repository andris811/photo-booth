import { useState } from "react";

type Props = {
  photos: string[];
  onRetake: (indexesToRetake: number[]) => void;
  onConfirm: () => void;
};

export function ReviewScreen({ photos, onRetake, onConfirm }: Props) {
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (index: number) => {
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {photos.map((src, index) => (
          <div
            key={index}
            className={`relative border-4 rounded-xl overflow-hidden cursor-pointer ${
              selected.includes(index)
                ? "border-red-500 scale-105"
                : "border-transparent"
            }`}
            onClick={() => toggleSelect(index)}
          >
            <img src={src} className="w-40 h-56 object-cover" />
            {selected.includes(index) && (
              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Retake
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => onRetake(selected)}
          disabled={selected.length === 0}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-lg font-semibold"
        >
          🔁 Retake Selected
        </button>
        <button
          onClick={onConfirm}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-semibold"
        >
          ✅ Confirm All
        </button>
      </div>
    </div>
  );
}
