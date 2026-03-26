const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.82;

interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  outputType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gagal memuat gambar.'));
    image.src = dataUrl;
  });
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  outputType: 'image/jpeg' | 'image/webp' | 'image/png',
  quality: number
) {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengompresi gambar.'));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Gagal membaca hasil kompresi.'));
        reader.readAsDataURL(blob);
      },
      outputType,
      quality
    );
  });
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
) {
  const {
    maxDimension = DEFAULT_MAX_DIMENSION,
    quality = DEFAULT_QUALITY,
    outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg',
  } = options;

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);

  const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas tidak tersedia untuk kompresi gambar.');
  }

  context.drawImage(image, 0, 0, width, height);

  const dataUrl = await canvasToDataUrl(canvas, outputType, quality);
  return {
    dataUrl,
    width,
    height,
    outputType,
    compressed: ratio < 1 || outputType !== file.type,
  };
}
