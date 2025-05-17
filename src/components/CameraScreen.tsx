import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

type Props = {
  onCaptureComplete: (photos: string[]) => void;
  count?: number; // 👈 optional prop
};

export function CameraScreen({ onCaptureComplete, count = 4 }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (webcamRef.current?.video) {
      webcamRef.current.video.onloadedmetadata = () => {
        console.log(
          "Actual video dimensions:",
          webcamRef.current?.video?.videoWidth,
          webcamRef.current?.video?.videoHeight
        );
      };
    }
  }, []);

  const captureSequence = async () => {
    if (!webcamRef.current) return;
    setCapturing(true);
    const photos: string[] = [];

    for (let i = 0; i < count; i++) {
      let sec = 5;
      setCountdown(sec);

      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          sec -= 1;
          setCountdown(sec);
          if (sec === 0) {
            clearInterval(interval);
            const image = webcamRef.current?.getScreenshot();
            if (image) photos.push(image);
            // 👇 Flash effect
            setFlash(true);
            setTimeout(() => setFlash(false), 200);

            // 👇 Add short delay before next countdown
            setTimeout(resolve, 900);
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

        {/* Flash overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white opacity-70 transition duration-200 pointer-events-none"></div>
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
