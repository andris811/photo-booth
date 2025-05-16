import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Transformer } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
  "/backgrounds/bg4.jpg",
];

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [bgImage] = useImage(selectedBg ?? "", "anonymous");
  const [photoImage] = useImage(image ?? "", "anonymous");
  const [photoProps, setPhotoProps] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 266,
  });
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (photoImage && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [photoImage]);

  const removeBackground = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/remove-bg", {
      method: "POST",
      body: formData,
    });

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const bgRemovedUrl = await removeBackground(file);
      setImage(bgRemovedUrl);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
          Hermès Photo Booth
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <label
              htmlFor="image-upload"
              className="cursor-pointer block text-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition"
            >
              Upload Photo
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            <p className="text-sm text-gray-600">Choose Background:</p>
            <div className="grid grid-cols-3 gap-2">
              {backgrounds.map((bg, index) => (
                <img
                  key={index}
                  src={bg}
                  onClick={() => setSelectedBg(bg)}
                  className={`h-16 w-full object-cover rounded-md border-4 cursor-pointer ${
                    selectedBg === bg
                      ? "border-orange-500"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="col-span-2 bg-gray-100 rounded-xl shadow aspect-[3/4] w-full">
            <Stage width={400} height={533}>
              <Layer>
                {bgImage && (
                  <KonvaImage
                    image={bgImage}
                    x={0}
                    y={0}
                    width={400}
                    height={533}
                  />
                )}
                {photoImage && (
                  <>
                    <KonvaImage
                      image={photoImage}
                      ref={imageRef}
                      x={photoProps.x}
                      y={photoProps.y}
                      width={photoProps.width}
                      height={photoProps.height}
                      draggable
                      onDragEnd={(e) =>
                        setPhotoProps((prev) => ({
                          ...prev,
                          x: e.target.x(),
                          y: e.target.y(),
                        }))
                      }
                      onTransformEnd={() => {
                        const node = imageRef.current;
                        if (!node) return;

                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();

                        node.scaleX(1);
                        node.scaleY(1);

                        setPhotoProps({
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(100, node.width() * scaleX),
                          height: Math.max(133, node.height() * scaleY),
                        });
                      }}
                    />
                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (
                          newBox.width < 100 ||
                          newBox.height < 133 ||
                          newBox.width > 500 ||
                          newBox.height > 666
                        ) {
                          return oldBox;
                        }
                        return newBox;
                      }}
                    />
                  </>
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
