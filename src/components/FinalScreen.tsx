import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { StickerImage } from "./StickerImage";
import type { Sticker } from "./StickerImage";
import { getStickerCanvasLayout } from "../utils/layout";
import { QRCodeCanvas } from "qrcode.react";
import type Konva from "konva";

type Props = {
  stageRef: React.RefObject<Konva.Stage | null>;
  background: string;
  cleanPhotos: string[];
  stickers: Sticker[];
  width: number;
  photoUrl: string | null;
  onDownload: () => void;
  onHome: () => void;
};

export function FinalScreen({
  stageRef,
  background,
  cleanPhotos,
  stickers,
  width,
  photoUrl,
  onDownload,
  onHome,
}: Props) {
  const [bgImage] = useImage(background, "anonymous");
  const [img1] = useImage(cleanPhotos[0] ?? "", "anonymous");
  const [img2] = useImage(cleanPhotos[1] ?? "", "anonymous");
  const [img3] = useImage(cleanPhotos[2] ?? "", "anonymous");
  const [img4] = useImage(cleanPhotos[3] ?? "", "anonymous");
  const images = [img1, img2, img3, img4];

  const { padding, photoWidth, photoHeight, totalHeight } = getStickerCanvasLayout(width);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Panel (QR + Buttons) */}
      <div className="w-full md:w-1/3 space-y-4 flex flex-col items-center justify-start">
        <p className="text-sm text-gray-600">Scan to download</p>
        {photoUrl ? (
          <QRCodeCanvas value={photoUrl} size={160} />
        ) : (
          <p className="text-sm text-gray-400 italic">Generating QR...</p>
        )}

        <button
          onClick={onDownload}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold w-full"
        >
          🖨️ Print
        </button>
        <button
          onClick={onHome}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold w-full"
        >
          🔙 Home
        </button>
      </div>

      {/* Right Canvas */}
      <div className="w-full md:w-2/3">
        <div
          className="relative w-full overflow-hidden border rounded-xl shadow bg-gray-100"
          style={{ height: totalHeight }}
        >
          <Stage width={width} height={totalHeight} ref={stageRef}>
            <Layer>
              {bgImage && (
                <KonvaImage
                  image={bgImage}
                  x={0}
                  y={0}
                  width={width}
                  height={totalHeight}
                  listening={false}
                />
              )}
              {images.map((img, i) => {
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
              {stickers.map((sticker) => (
                <StickerImage
                  key={sticker.id}
                  sticker={sticker}
                  isSelected={false}
                  onSelect={() => {}}
                  onDelete={() => {}}
                  onChange={() => {}}
                  readonly={true} 
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
