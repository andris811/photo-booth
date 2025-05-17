import { useMemo } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { getCoverSize } from "../utils/layout";

type Props = {
  src: string;
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
};

export function PhotoPreview({ src, x, y, boxWidth, boxHeight }: Props) {
  const [image] = useImage(src, "anonymous");

  const { width, height, offsetX, offsetY } = useMemo(() => {
    if (!image) return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
    return getCoverSize(boxWidth, boxHeight, image.width, image.height);
  }, [image, boxWidth, boxHeight]);

  return image ? (
    <KonvaImage
      image={image}
      x={x + offsetX}
      y={y + offsetY}
      width={width}
      height={height}
    />
  ) : null;
}
