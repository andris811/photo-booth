// ... existing imports
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import useImage from "use-image";
import Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Text } from "react-konva";

import { StickerImage } from "./components/StickerImage";
import type { Sticker } from "./components/StickerImage";
import { getCoverSize } from "./utils/layout";
import { uploadToFastApi } from "./services/uploadToFastApi";
import { CameraScreen } from "./components/CameraScreen";
import { ReviewScreen } from "./components/ReviewScreen";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
  "/backgrounds/bg4.jpg",
];

type Screen =
  | "welcome"
  | "camera"
  | "review"
  | "remove-bg"
  | "select-bg"
  | "stickers"
  | "final";

function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedBg, setSelectedBg] = useState<string | null>(null);
  const [bgImage] = useImage(selectedBg ?? "", "anonymous");
  const [cleanPhotos, setCleanPhotos] = useState<string[]>([]);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoImage] = useImage(capturedImage ?? "", "anonymous");

  const [countdown, setCountdown] = useState<number | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [qrVisible, setQrVisible] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [photos, setPhotos] = useState<string[]>([]);
  const [retakeIndexes, setRetakeIndexes] = useState<number[] | null>(null);

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

  const handleRetakePhotos = (indexes: number[]) => {
    setRetakeIndexes(indexes);
    setScreen("camera");
  };

  const handleRetakeConfirm = (newShots: string[]) => {
    if (!retakeIndexes) return;
    const updated = [...photos];
    retakeIndexes.forEach((index, i) => {
      updated[index] = newShots[i];
    });
    setPhotos(updated);
    setRetakeIndexes(null);
    setScreen("review");
  };

  const removeBackgroundFromBase64 = async (
    base64: string
  ): Promise<string> => {
    const blob = await (await fetch(base64)).blob();
    const formData = new FormData();
    formData.append("file", blob, "photo.png");

    const response = await fetch("http://localhost:8000/remove-bg", {
      method: "POST",
      body: formData,
    });

    const resultBlob = await response.blob();
    return URL.createObjectURL(resultBlob);
  };

  // 🔁 RUN BACKGROUND REMOVAL PIPELINE
  useEffect(() => {
    if (screen === "remove-bg" && photos.length > 0) {
      (async () => {
        const cleaned: string[] = [];
        for (const base64 of photos) {
          const cleanedUrl = await removeBackgroundFromBase64(base64);
          cleaned.push(cleanedUrl);
        }
        setCleanPhotos(cleaned);
        setScreen("select-bg");
      })();
    }
  }, [screen, photos]);

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
          Hermès Photo Booth
        </h1>

        {screen === "welcome" && (
          <div className="text-center">
            <button
              onClick={() => setScreen("camera")}
              className="text-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl shadow"
            >
              Begin
            </button>
          </div>
        )}

        {screen === "camera" && (
          <CameraScreen
            count={retakeIndexes ? retakeIndexes.length : 4}
            onCaptureComplete={(captured) => {
              if (retakeIndexes) {
                const updated = [...photos];
                retakeIndexes.forEach((index, i) => {
                  updated[index] = captured[i];
                });
                setPhotos(updated);
                setRetakeIndexes(null);
                setScreen("review");
              } else {
                setPhotos(captured);
                setScreen("review");
              }
            }}
          />
        )}

        {screen === "review" && (
          <ReviewScreen
            photos={photos}
            onRetake={handleRetakePhotos}
            onConfirm={() => setScreen("remove-bg")}
          />
        )}

        {screen === "remove-bg" && (
          <div className="text-center space-y-4">
            <p className="text-xl font-medium text-gray-600">
              Removing Backgrounds...
            </p>
            <p className="text-sm text-gray-400">This may take a few seconds</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
