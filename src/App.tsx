import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import { StickerImage } from "./components/StickerImage";
import type { Sticker } from "./components/StickerImage";
import { getCoverSize } from "./utils/layout";
import { QRCodeCanvas } from "qrcode.react";
import Konva from "konva";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
  "/backgrounds/bg4.jpg",
];

type Screen = "landing" | "preview" | "result";

function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [bgImage] = useImage(selectedBg ?? "", "anonymous");

  const [liveImage, setLiveImage] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoImage] = useImage(capturedImage ?? "", "anonymous");

  const [countdown, setCountdown] = useState<number | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [qrVisible, setQrVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 533 });
  const [canvasKey, setCanvasKey] = useState(0);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = (width / 3) * 4;
        setCanvasSize({ width, height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (
      bgImage?.width &&
      bgImage?.height &&
      canvasSize.width > 0 &&
      canvasSize.height > 0
    ) {
      setCanvasKey((prev) => prev + 1);
    }
  }, [
    bgImage?.src,
    bgImage?.width,
    bgImage?.height,
    canvasSize.width,
    canvasSize.height,
  ]);

  const getPhotoProps = () => {
    const width = canvasSize.width * 0.6;
    const height = canvasSize.height * 0.6;
    const x = (canvasSize.width - width) / 2;
    const y = (canvasSize.height - height) / 2;
    return { width, height, x, y };
  };

  const addSticker = (src: string) => {
    const newSticker: Sticker = {
      id: crypto.randomUUID(),
      src,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      scale: 1,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await removeBackground(file);
    setLiveImage(url);
    setScreen("preview");
  };

  const handleCapture = () => {
    let seconds = 5;
    setCountdown(seconds);

    const interval = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds === 0) {
        clearInterval(interval);
        setCapturedImage(liveImage);
        setCountdown(null);
        setScreen("result");
      }
    }, 1000);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setLiveImage(null);
    setSelectedBg(null);
    setStickers([]);
    setSelectedId(null);
    setPhotoUrl(null);
    setQrVisible(false);
    setScreen("landing");
  };

  const handleDownload = () => {
    const uri = stageRef.current?.toDataURL();
    if (!uri) return;
    const link = document.createElement("a");
    link.download = "hermes-photo.png";
    link.href = uri;
    link.click();
  };

  const handleGenerateQR = () => {
  const uri = stageRef.current?.toDataURL();
  if (!uri) return;
  alert("QR code can't be generated from base64. Please host the image first.");
};


  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
          Hermès Photo Booth
        </h1>

        {screen === "landing" && (
          <div className="text-center">
            <button
              onClick={() => setScreen("preview")}
              className="text-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl shadow"
            >
              📸 Take a Photo
            </button>
          </div>
        )}

        {(screen === "preview" || screen === "result") && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              {screen === "preview" && (
                <>
                  <p className="text-sm text-gray-600 font-semibold">
                    Choose Background:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backgrounds.map((bg, index) => (
                      <img
                        key={index}
                        src={bg}
                        onClick={() => setSelectedBg(bg)}
                        className={`h-20 w-full object-cover rounded-md border-4 cursor-pointer ${
                          selectedBg === bg
                            ? "border-orange-500"
                            : "border-transparent"
                        }`}
                      />
                    ))}
                  </div>

                  <label className="block bg-orange-500 hover:bg-orange-600 text-white text-center py-2 rounded-xl cursor-pointer font-medium transition mt-6">
                    Upload a Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>

                  {liveImage && selectedBg && (
                    <button
                      onClick={handleCapture}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl font-semibold mt-4"
                    >
                      Take Picture
                    </button>
                  )}
                </>
              )}

              {screen === "result" && (
                <>
                  <p className="text-sm text-gray-600 font-semibold">
                    Add Stickers:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["hat.png", "glasses.png", "star.png", "horse.png"].map((file) => (
                      <img
                        key={file}
                        src={`/stickers/${file}`}
                        onClick={() => addSticker(`/stickers/${file}`)}
                        className="h-16 w-full object-contain border rounded-md cursor-pointer hover:border-orange-400"
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-semibold mt-4"
                  >
                    💾 Save Image
                  </button>

                  <button
                    onClick={handleGenerateQR}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-xl font-semibold"
                  >
                    📱 Show QR Code
                  </button>
                </>
              )}
            </div>

            <div className="w-full md:w-2/3">
              <div
                ref={containerRef}
                className="relative w-full aspect-[3/4] border rounded-xl overflow-hidden shadow bg-gray-100"
              >
                <Stage
                  ref={stageRef}
                  key={canvasKey}
                  width={canvasSize.width}
                  height={canvasSize.height}
                >
                  <Layer>
                    <Rect
                      width={canvasSize.width}
                      height={canvasSize.height}
                      fill="transparent"
                      onClick={() => setSelectedId(null)}
                      onTap={() => setSelectedId(null)}
                    />

                    {bgImage &&
                      (() => {
                        const { width, height, offsetX, offsetY } =
                          getCoverSize(
                            canvasSize.width,
                            canvasSize.height,
                            bgImage.width,
                            bgImage.height
                          );
                        return (
                          <KonvaImage
                            image={bgImage}
                            x={offsetX}
                            y={offsetY}
                            width={width}
                            height={height}
                          />
                        );
                      })()}

                    {(screen === "preview" ? liveImage : capturedImage) && (
                      <KonvaImage
                        image={photoImage}
                        {...getPhotoProps()}
                        listening={false}
                      />
                    )}

                    {screen === "result" &&
                      stickers.map((sticker) => (
                        <StickerImage
                          key={sticker.id}
                          sticker={sticker}
                          isSelected={sticker.id === selectedId}
                          onSelect={() => setSelectedId(sticker.id)}
                          onDelete={() =>
                            setStickers((prev) =>
                              prev.filter((s) => s.id !== sticker.id)
                            )
                          }
                          onChange={(newProps) =>
                            setStickers((prev) =>
                              prev.map((s) =>
                                s.id === sticker.id ? { ...s, ...newProps } : s
                              )
                            )
                          }
                        />
                      ))}

                    {countdown !== null && (
                      <Text
                        text={`${countdown}`}
                        fontSize={80}
                        fill="white"
                        stroke="black"
                        strokeWidth={2}
                        x={canvasSize.width / 2 - 20}
                        y={canvasSize.height / 2 - 40}
                      />
                    )}
                  </Layer>
                </Stage>

                {qrVisible && photoUrl && (
                  <div className="absolute bottom-2 right-2 bg-white p-2 rounded shadow">
                    <p className="text-xs text-center text-gray-500 mb-1">Scan to download</p>
                    <QRCodeCanvas value={photoUrl} size={100} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {screen === "result" && (
          <div className="text-center mt-4">
            <button
              onClick={handleRetake}
              className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-xl font-semibold"
            >
              🔁 Retake Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;