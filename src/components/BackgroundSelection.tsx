import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { useRef, useEffect, useState } from "react";
import Konva from "konva";
import { PhotoPreview } from "./PhotoPreview";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
  "/backgrounds/bg4.jpg",
];

type Props = {
  cleanPhotos: string[];
  selectedBg: string | null;
  setSelectedBg: (bg: string) => void;
  onConfirm: () => void;
};

export function BackgroundSelection({
  cleanPhotos,
  selectedBg,
  setSelectedBg,
  onConfirm,
}: Props) {
  const [bgImage] = useImage(selectedBg ?? "", "anonymous");
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 533 });

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = (width / 3) * 4;
        setCanvasSize({ width, height });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const padding = 20;
  const photoWidth = (canvasSize.width - padding * 3) / 2;
  const photoHeight = (canvasSize.height - padding * 3) / 2;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Background choices */}
      <div className="w-full md:w-1/3 space-y-4">
        <p className="text-sm text-gray-600 font-semibold">Choose Background:</p>
        <div className="grid grid-cols-2 gap-2">
          {backgrounds.map((bg) => (
            <img
              key={bg}
              src={bg}
              onClick={() => setSelectedBg(bg)}
              className={`h-20 w-full object-cover rounded-md border-4 cursor-pointer ${
                selectedBg === bg ? "border-orange-500" : "border-transparent"
              }`}
            />
          ))}
        </div>
        <button
          className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 w-full rounded-xl font-semibold"
          onClick={onConfirm}
        >
          Confirm
        </button>
      </div>

      {/* Right: Preview */}
      <div className="w-full md:w-2/3">
        <div
          ref={containerRef}
          className="relative w-full aspect-[3/4] border rounded-xl overflow-hidden shadow bg-gray-100"
        >
          <Stage width={canvasSize.width} height={canvasSize.height} ref={stageRef}>
            <Layer>
              {bgImage && (
                <KonvaImage
                  image={bgImage}
                  x={0}
                  y={0}
                  width={canvasSize.width}
                  height={canvasSize.height}
                />
              )}
              {cleanPhotos.map((photo, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = padding + col * (photoWidth + padding);
                const y = padding + row * (photoHeight + padding);

                return (
                  <PhotoPreview
                    key={i}
                    src={photo}
                    x={x}
                    y={y}
                    boxWidth={photoWidth}
                    boxHeight={photoHeight}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
