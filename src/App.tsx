import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { uploadToFastApi } from "./services/uploadToFastApi";
import { CameraScreen } from "./components/CameraScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { BackgroundSelection } from "./components/BackgroundSelection";
import { cropCenterPortrait } from "./utils/imageUtils";
import { StickerOverlay } from "./components/StickerOverlay";
import { FinalCanvas } from "./components/FinalCanvas";
import type { Sticker } from "./components/StickerImage";
import Konva from "konva";

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
  const [cleanPhotos, setCleanPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [retakeIndexes, setRetakeIndexes] = useState<number[] | null>(null);

  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 533 });

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

  const handleRetakePhotos = (indexes: number[]) => {
    setRetakeIndexes(indexes);
    setScreen("camera");
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

  useEffect(() => {
    if (
      screen === "remove-bg" &&
      cleanPhotos.length === 0 &&
      photos.length === 4
    ) {
      (async () => {
        const cropped = await Promise.all(photos.map(cropCenterPortrait));
        const removed = await Promise.all(
          cropped.map(removeBackgroundFromBase64)
        );
        setCleanPhotos(removed);
        setScreen("select-bg");
      })();
    }
  }, [screen, photos, cleanPhotos.length]);

  useEffect(() => {
  if (screen === "final" && !photoUrl) {
    const timeout = setTimeout(() => {
      handleGenerateQR();
    }, 500); // short delay to let <FinalCanvas /> paint

    return () => clearTimeout(timeout);
  }
}, [screen, photoUrl]);

  const handleDownload = () => {
    const uri = stageRef.current?.toDataURL({ mimeType: "image/png" });
    if (!uri) return;
    const link = document.createElement("a");
    link.href = uri;
    link.download = "hermes-photo.png";
    link.click();
  };

  const handleGenerateQR = async () => {
    const uri = stageRef.current?.toDataURL({ mimeType: "image/png" });
    if (!uri) return;
    const blob = await (await fetch(uri)).blob();
    const url = await uploadToFastApi(blob);
    if (url) setPhotoUrl(url);
    else alert("Upload failed.");
  };

  const handleRetake = () => {
    setScreen("welcome");
    setPhotos([]);
    setCleanPhotos([]);
    setSelectedBg(null);
    setStickers([]);
    setSelectedId(null);
    setPhotoUrl(null);
  };

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
              } else {
                setPhotos(captured);
              }
              setScreen("review");
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
            <p className="text-sm text-gray-400">Please wait a moment</p>
          </div>
        )}

        {screen === "select-bg" && (
          <BackgroundSelection
            cleanPhotos={cleanPhotos}
            selectedBg={selectedBg}
            setSelectedBg={setSelectedBg}
            onConfirm={() => setScreen("stickers")}
          />
        )}

        {screen === "stickers" && selectedBg && (
          <StickerOverlay
            cleanPhotos={cleanPhotos}
            background={selectedBg}
            stickers={stickers}
            setStickers={setStickers}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onConfirm={() => {
              handleGenerateQR(); // prepare QR before final
              setScreen("final");
            }}
            onBack={() => setScreen("select-bg")}
            stageWrapperRef={{ current: null }} // deprecated, no longer used
          />
        )}

        {screen === "final" && selectedBg && (
          <div className="flex flex-col gap-6 items-center">
            <div className="flex flex-col md:flex-row gap-6 w-full items-start">
              <div className="rounded-xl overflow-hidden shadow w-full max-w-lg">
                <FinalCanvas
                  ref={stageRef}
                  background={selectedBg}
                  cleanPhotos={cleanPhotos}
                  stickers={stickers}
                  width={canvasSize.width}
                  height={((canvasSize.width - 60) / 2 / 0.75) * 2 + 60}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-600">Scan to download</p>
                {photoUrl && <QRCodeCanvas value={photoUrl} size={160} />}
              </div>
            </div>

            <div className="flex justify-between w-full mt-4">
              <button
                onClick={handleDownload}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleRetake}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                🔙 Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
