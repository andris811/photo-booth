export function getCoverSize(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
) {
  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  let width = containerWidth;
  let height = containerHeight;

  if (imageRatio > containerRatio) {
    height = containerHeight;
    width = imageWidth * (containerHeight / imageHeight);
  } else {
    width = containerWidth;
    height = imageHeight * (containerWidth / imageWidth);
  }

  const offsetX = (containerWidth - width) / 2;
  const offsetY = (containerHeight - height) / 2;

  return { width, height, offsetX, offsetY };
}

export function getStickerCanvasLayout(canvasWidth: number) {
  const padding = 20;
  const photoWidth = (canvasWidth - padding * 3) / 2;
  const photoHeight = photoWidth / 0.75;
  const totalHeight = photoHeight * 2 + padding * 3;
  return { padding, photoWidth, photoHeight, totalHeight };
}