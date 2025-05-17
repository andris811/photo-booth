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
