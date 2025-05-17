export async function uploadToFastApi(file: Blob): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.url) {
      return result.url;
    } else {
      console.error("Upload failed:", result);
      return null;
    }
  } catch (err) {
    console.error("Network or server error:", err);
    return null;
  }
}
