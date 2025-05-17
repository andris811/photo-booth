import { useEffect, useRef } from "react";
import { Group, Image as KonvaImage, Transformer, Circle, Text } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

export type Sticker = {
  id: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

type Props = {
  sticker: Sticker;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onChange: (newProps: Partial<Sticker>) => void;
};

export function StickerImage({ sticker, isSelected, onSelect, onDelete, onChange }: Props) {
  const [image] = useImage(sticker.src, "anonymous");
  const groupRef = useRef<Konva.Group | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const STICKER_SIZE = 100;

  return (
    <>
      <Group
        x={sticker.x}
        y={sticker.y}
        draggable
        ref={groupRef}
        onClick={onSelect}
        onTap={onSelect}
        rotation={sticker.rotation}
        scaleX={sticker.scale}
        scaleY={sticker.scale}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          if (!groupRef.current) return;
          const node = groupRef.current;
          onChange({
            x: node.x(),
            y: node.y(),
            scale: node.scaleX(),
            rotation: node.rotation(),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      >
        <KonvaImage image={image} width={STICKER_SIZE} height={STICKER_SIZE} />

        {isSelected && (
          <>
            <Circle
              x={STICKER_SIZE}
              y={0}
              radius={12}
              fill="white"
              stroke="red"
              strokeWidth={2}
              onClick={(e) => {
                e.cancelBubble = true;
                onDelete();
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                onDelete();
              }}
            />
            <Text
              text="✕"
              x={STICKER_SIZE - 6}
              y={-6}
              fontSize={16}
              fill="red"
              fontStyle="bold"
              onClick={(e) => {
                e.cancelBubble = true;
                onDelete();
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                onDelete();
              }}
            />
          </>
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) =>
            newBox.width < 30 || newBox.height < 30 ? oldBox : newBox
          }
        />
      )}
    </>
  );
}
