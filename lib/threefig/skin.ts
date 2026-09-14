export const skinAreas = [
  "Left cheek",
  "Right cheek",
  "Forehead",
  "Chin",
] as const;
export const skinRoutines = [
  "Before skincare",
  "After skincare",
  "Other conditions",
] as const;
export type PhotoAnalysis = {
  method: "photo-pixels-v1";
  colorVariation: number;
  surfaceContrast: number;
  brightness: number;
  clippedFraction: number;
  quality: "usable" | "limited";
  width: number;
  height: number;
};
export type SkinRecord = {
  id: string;
  observedAt: string;
  area: string;
  feeling: string;
  routine: string;
  note: string;
  analysis: PhotoAnalysis;
  photoUrl: string;
};

/** Descriptors of a selected photograph patch. These are not skin-health scores. */
export function analyzePixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): PhotoAnalysis {
  if (width < 2 || height < 2 || data.length !== width * height * 4)
    throw new Error("Invalid image dimensions.");
  const n = width * height,
    sums = [0, 0, 0],
    squares = [0, 0, 0];
  let luminance = 0,
    clipped = 0,
    contrast = 0,
    pairs = 0;
  const luma = (i: number) =>
    0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4,
        l = luma(i);
      luminance += l;
      if (l < 4 || l > 251) clipped++;
      for (let c = 0; c < 3; c++) {
        sums[c] += data[i + c];
        squares[c] += data[i + c] ** 2;
      }
      if (x + 1 < width) {
        contrast += Math.abs(l - luma(i + 4));
        pairs++;
      }
      if (y + 1 < height) {
        contrast += Math.abs(l - luma(i + width * 4));
        pairs++;
      }
    }
  const round = (v: number) => Math.round(v * 10) / 10;
  return {
    method: "photo-pixels-v1",
    colorVariation: round(
      squares.reduce(
        (a, v, c) => a + Math.sqrt(Math.max(0, v / n - (sums[c] / n) ** 2)),
        0,
      ) / 3,
    ),
    surfaceContrast: round(contrast / pairs),
    brightness: round(luminance / n),
    clippedFraction: Math.round((clipped / n) * 1000) / 1000,
    quality: clipped / n > 0.15 ? "limited" : "usable",
    width,
    height,
  };
}
export function canComparePhotos(a: SkinRecord, b: SkinRecord) {
  return (
    a.area === b.area &&
    a.routine === b.routine &&
    a.analysis.method === b.analysis.method &&
    a.analysis.quality === "usable" &&
    b.analysis.quality === "usable" &&
    Math.abs(a.analysis.brightness - b.analysis.brightness) < 25
  );
}
export function photoSummary(a: PhotoAnalysis) {
  return a.quality === "limited"
    ? "Some detail is lost in light or shadow."
    : "A moment to compare, over time.";
}
export async function loadPhoto(file: File) {
  if (file.size > 12 * 1024 * 1024)
    throw new Error("Choose a photo smaller than 12 MB.");
  if (!/^image\/(jpeg|png|webp|avif|heic|heif)$/i.test(file.type))
    throw new Error("Choose a JPEG, PNG, WebP, or a camera photo.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (Math.min(image.naturalWidth, image.naturalHeight) < 256)
      throw new Error(
        "Choose a larger photo, at least 256 pixels on each side.",
      );
    if (image.naturalWidth * image.naturalHeight > 50000000)
      throw new Error(
        "This photo is too large. Choose a smaller camera image.",
      );
    return { image, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    if (error instanceof Error && error.message.startsWith("Choose"))
      throw error;
    throw new Error(
      "This browser could not read that photo. Try a JPEG or PNG.",
    );
  }
}
export function cropRegion(
  width: number,
  height: number,
  focusX: number,
  focusY: number,
) {
  const size = Math.min(width, height) * 0.6;
  return {
    x: ((width - size) * Math.max(0, Math.min(100, focusX))) / 100,
    y: ((height - size) * Math.max(0, Math.min(100, focusY))) / 100,
    size,
  };
}
export async function preparePhoto(
  image: HTMLImageElement,
  focusX: number,
  focusY: number,
) {
  const {
    x,
    y,
    size: patch,
  } = cropRegion(image.naturalWidth, image.naturalHeight, focusX, focusY);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Photo processing is unavailable in this browser.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 768, 768);
  ctx.drawImage(image, x, y, patch, patch, 0, 0, 768, 768);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("Could not prepare the photo.")),
      "image/jpeg",
      0.84,
    ),
  );
  const small = document.createElement("canvas");
  small.width = small.height = 256;
  const s = small.getContext("2d");
  if (!s) throw new Error("Photo processing is unavailable.");
  s.drawImage(canvas, 0, 0, 256, 256);
  return {
    blob,
    preview: URL.createObjectURL(blob),
    analysis: analyzePixels(s.getImageData(0, 0, 256, 256).data, 256, 256),
  };
}
