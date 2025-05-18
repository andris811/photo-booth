import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

type Props = {
  onCaptureComplete: (photos: string[]) => void;
  count?: number;
};

export function CameraScreen({ onCaptureComplete, count = 4 }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (webcamRef.current?.video) {
      webcamRef.current.video.onloadedmetadata = () => {
      };
    }
  }, []);

  const cropToPortrait = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        const targetHeight = height;
        const targetWidth = (height * 3) / 4; // 3:4 ratio
        const offsetX = (width - targetWidth) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, offsetX, 0, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
          resolve(canvas.toDataURL("image/png"));
        } else {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    });
  };

  const captureSequence = async () => {
    if (!webcamRef.current) return;
    setCapturing(true);
    const photos: string[] = [];

    for (let i = 0; i < count; i++) {
      let sec = 5;
      setCountdown(sec);

      await new Promise<void>((resolve) => {
        const interval = setInterval(async () => {
          sec -= 1;
          setCountdown(sec);
          if (sec === 0) {
            clearInterval(interval);
            const raw = webcamRef.current?.getScreenshot();
            if (raw) {
              const cropped = await cropToPortrait(raw);
              photos.push(cropped);
            }

            setFlash(true);
            setTimeout(() => setFlash(false), 150);
            setTimeout(resolve, 800);
          }
        }, 1000);
      });
    }

    setCountdown(null);
    setCapturing(false);
    onCaptureComplete(photos);
  };

  return (
    <div className="flex flex-col items-center space-y-6 px-4">
      <div
        className="relative w-full max-w-4xl bg-black rounded-lg shadow overflow-hidden"
        style={{ aspectRatio: "16 / 9" }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/png"
          videoConstraints={{
            facingMode: "user",
            width: 1920,
            height: 1080,
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Camera Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-4 border-orange-500 w-2/5 aspect-[3/4] rounded-lg"></div>
        </div>

        {/* Flash */}
        {flash && (
          <div className="absolute inset-0 bg-white opacity-80 transition duration-200 pointer-events-none"></div>
        )}
      </div>

      {countdown !== null ? (
        <div className="text-6xl font-bold text-orange-600">{countdown}</div>
      ) : (
        <button
          disabled={capturing}
          onClick={captureSequence}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-lg font-semibold"
        >
          📸 Take {count} Photo{count > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
