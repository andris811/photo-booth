export async function cropCenterPortrait(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspect = 3 / 4; // portrait

      let targetWidth = img.width;
      let targetHeight = img.height;

      if (img.width / img.height > aspect) {
        // Image is too wide
        targetWidth = img.height * aspect;
      } else {
        // Image is too tall
        targetHeight = img.width / aspect;
      }

      const offsetX = (img.width - targetWidth) / 2;
      const offsetY = (img.height - targetHeight) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        targetWidth,
        targetHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = base64;
  });
}
