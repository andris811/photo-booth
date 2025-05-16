import { useState } from "react";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
  "/backgrounds/bg4.jpg",
];

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedBg, setSelectedBg] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-orange-600 text-center mb-6">Hermès Photo Booth</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar for background options */}
          <div className="w-full md:w-1/3">
            <p className="text-sm text-gray-500 mb-2">Choose a background:</p>
            <div className="grid grid-cols-3 gap-2">
              {backgrounds.map((bg, index) => (
                <img
                  key={index}
                  src={bg}
                  alt={`Background ${index + 1}`}
                  onClick={() => setSelectedBg(bg)}
                  className={`h-20 w-full object-cover rounded-md cursor-pointer border-4 ${
                    selectedBg === bg ? "border-orange-500" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Preview Area */}
          <div className="w-full md:w-2/3">
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition mb-4"
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

            <div className="relative w-full aspect-[3/4] border rounded-xl overflow-hidden shadow-md bg-gray-100">
              {selectedBg && (
                <img
                  src={selectedBg}
                  alt="Selected background"
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              )}
              {image && (
                <img
                  src={image}
                  alt="User photo"
                  className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
