import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { uploadToFastApi } from "./services/uploadToFastApi";
import { CameraScreen } from "./components/CameraScreen";
import { ReviewScreen } from "./components/ReviewScreen";
import { BackgroundSelection } from "./components/BackgroundSelection";
import { cropCenterPortrait } from "./utils/imageUtils";
import { StickerOverlay } from "./components/StickerOverlay";
import { FinalScreen } from "./components/FinalScreen";
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
  const stageWrapperRef = useRef<HTMLDivElement | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // const [canvasSize, setCanvasSize] = useState({ width: 400, height: 533 });
  const finalCanvasWidth = parseInt(stageWrapperRef.current?.dataset.canvasWidth || "800");

  // this might remove if no need for it ----------------------------------------------------------------<-----<-----
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // const width = containerRef.current.offsetWidth;
        // const height = (width / 3) * 4;
        // setCanvasSize({ width, height });
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

  const exportHighResDataUrl = (scale: number = 3) => {
    const stage = stageRef.current;
    if (!stage) return null;
    return stage.toDataURL({
      mimeType: "image/png",
      pixelRatio: scale,
    });
  };

  const handleDownload = () => {
    const uri = exportHighResDataUrl(3);
    if (!uri) return;
    const link = document.createElement("a");
    link.href = uri;
    link.download = "hermes-photo.png";
    link.click();
  };

  const handleGenerateQR = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;

    // Create high-res image (3x scale)
    const uri = stage.toDataURL({ mimeType: "image/png", pixelRatio: 3 });
    const blob = await (await fetch(uri)).blob();

    const url = await uploadToFastApi(blob);
    if (url) setPhotoUrl(url);
    else alert("Upload failed.");
  }, []);

  useEffect(() => {
    if (screen === "final" && !photoUrl) {
      const timeout = setTimeout(() => {
        handleGenerateQR();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [screen, photoUrl, handleGenerateQR]);

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
              handleGenerateQR(); // Generate QR before entering final screen
              setScreen("final");
            }}
            onBack={() => setScreen("select-bg")}
            stageWrapperRef={stageWrapperRef} // deprecated but retained for prop compatibility
          />
        )}

        {screen === "final" && selectedBg && (
          <FinalScreen
            stageRef={stageRef}
            background={selectedBg}
            cleanPhotos={cleanPhotos}
            stickers={stickers}
            width={finalCanvasWidth}
            photoUrl={photoUrl}
            onDownload={handleDownload}
            onHome={handleRetake}
          />
        )}
      </div>
    </div>
  );
}

export default App;
