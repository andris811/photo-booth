// src/services/uploadToImgur.ts
export async function uploadToImgur(file: Blob, clientId: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      Authorization: `Client-ID ${clientId}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    console.error("Imgur upload failed:", result);
    return null;
  }

  return result.data.link; // This is the direct image URL
}
