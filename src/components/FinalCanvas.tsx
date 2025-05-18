import { forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { StickerImage } from "./StickerImage";
import type { Sticker } from "./StickerImage";
import type Konva from "konva";
import { getStickerCanvasLayout } from "../utils/layout";

type Props = {
  background: string;
  cleanPhotos: string[];
  stickers: Sticker[];
  width: number;
  height: number;
};

// Use forwardRef to allow ref access to Stage
export const FinalCanvas = forwardRef<Konva.Stage, Props>(
  ({ background, cleanPhotos, stickers, width, height }, ref) => {
    const [bgImage] = useImage(background, "anonymous");
    const [img1] = useImage(cleanPhotos[0] ?? "", "anonymous");
    const [img2] = useImage(cleanPhotos[1] ?? "", "anonymous");
    const [img3] = useImage(cleanPhotos[2] ?? "", "anonymous");
    const [img4] = useImage(cleanPhotos[3] ?? "", "anonymous");
    const images = [img1, img2, img3, img4];

    const allLoaded = bgImage && images.every((img) => !!img);
    const { padding, photoWidth, photoHeight } = getStickerCanvasLayout(width);

    if (!allLoaded) return null;

    return (
      <Stage ref={ref} width={width} height={height}>
        <Layer>
          <KonvaImage
            image={bgImage}
            x={0}
            y={0}
            width={width}
            height={height}
            listening={false}
          />
          {images.map((img, i) => {
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
            />
          ))}
        </Layer>
      </Stage>
    );
  }
);
