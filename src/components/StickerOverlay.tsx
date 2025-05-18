import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { StickerImage } from "./StickerImage";
import type { Sticker } from "./StickerImage";
import { getStickerCanvasLayout } from "../utils/layout";

type Props = {
  cleanPhotos: string[];
  background: string;
  stickers: Sticker[];
  setStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onConfirm: () => void;
  onBack: () => void;
  stageWrapperRef: React.RefObject<HTMLDivElement | null>;
};

export function StickerOverlay({
  cleanPhotos,
  background,
  stickers,
  setStickers,
  selectedId,
  setSelectedId,
  onConfirm,
  onBack,
  stageWrapperRef,
}: Props) {
  const [bgImage] = useImage(background ?? "", "anonymous");
  const [photo1] = useImage(cleanPhotos[0] ?? "", "anonymous");
  const [photo2] = useImage(cleanPhotos[1] ?? "", "anonymous");
  const [photo3] = useImage(cleanPhotos[2] ?? "", "anonymous");
  const [photo4] = useImage(cleanPhotos[3] ?? "", "anonymous");
  const photoImages = [photo1, photo2, photo3, photo4];

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

  useEffect(() => {
    if (stageWrapperRef.current) {
      stageWrapperRef.current.dataset.canvasWidth = canvasSize.width.toString();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasSize.width]);

  const { padding, photoWidth, photoHeight, totalHeight } =
    getStickerCanvasLayout(canvasSize.width);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Panel */}
      <div className="w-full md:w-1/3 space-y-4">
        <p className="text-sm text-gray-600 font-semibold">Add Stickers:</p>
        <div className="grid grid-cols-3 gap-2">
          {["hat.png", "glasses.png", "star.png", "horse.png"].map((file) => (
            <img
              key={file}
              src={`/stickers/${file}`}
              onClick={() =>
                setStickers((prev: Sticker[]) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    src: `/stickers/${file}`,
                    x: 100,
                    y: 100,
                    scale: 1,
                    rotation: 0,
                  },
                ])
              }
              className="h-16 w-full object-contain border rounded-md cursor-pointer hover:border-orange-400"
            />
          ))}
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold"
        >
          ✅ Confirm
        </button>

        <button
          onClick={onBack}
          className="w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded-xl font-medium"
        >
          🔙 Change Background
        </button>
      </div>

      {/* Right Canvas */}
      <div className="w-full md:w-2/3">
        <div
          ref={(el) => {
            containerRef.current = el;
            if (stageWrapperRef && el) stageWrapperRef.current = el;
          }}
          className="relative w-full overflow-hidden border rounded-xl shadow bg-gray-100"
          style={{ height: totalHeight }}
        >
          <Stage
            width={canvasSize.width}
            height={totalHeight}
            ref={stageRef}
            onMouseDown={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) setSelectedId(null);
            }}
          >
            <Layer>
              {/* Background */}
              {bgImage && (
                <KonvaImage
                  image={bgImage}
                  x={0}
                  y={0}
                  width={canvasSize.width}
                  height={totalHeight}
                  listening={false}
                />
              )}

              {/* 4 Photos */}
              {photoImages.map((img, i) => {
                if (!img) return null;
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = padding + col * (photoWidth + padding);
                const y = padding + row * (photoHeight + padding);
                return (
                  <KonvaImage
                    key={i}
                    image={img}
                    x={x}
                    y={y}
                    width={photoWidth}
                    height={photoHeight}
                    listening={false}
                  />
                );
              })}

              {/* Stickers */}
              {stickers.map((sticker) => (
                <StickerImage
                  key={sticker.id}
                  sticker={sticker}
                  isSelected={sticker.id === selectedId}
                  onSelect={() => setSelectedId(sticker.id)}
                  onDelete={() =>
                    setStickers((prev: Sticker[]) =>
                      prev.filter((s) => s.id !== sticker.id)
                    )
                  }
                  onChange={(newProps) =>
                    setStickers((prev: Sticker[]) =>
                      prev.map((s) =>
                        s.id === sticker.id ? { ...s, ...newProps } : s
                      )
                    )
                  }
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
