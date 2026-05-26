type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CreateCroppedImageFileParams = {
  cropAreaPixels: CropAreaPixels;
  fileName: string;
  mimeType: string;
  rotation: number;
  sourceImageUrl: string;
};

export async function CreateCroppedImageFile({
  cropAreaPixels,
  fileName,
  mimeType,
  rotation,
  sourceImageUrl,
}: CreateCroppedImageFileParams) {
  const image = await LoadImage(sourceImageUrl);
  const radians = DegreesToRadians(rotation);
  const rotatedBounds = GetRotatedBounds(image.width, image.height, radians);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas is not available.");
  }

  canvas.width = rotatedBounds.width;
  canvas.height = rotatedBounds.height;

  context.translate(rotatedBounds.width / 2, rotatedBounds.height / 2);
  context.rotate(radians);
  context.translate(-image.width / 2, -image.height / 2);
  context.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    throw new Error("Canvas is not available.");
  }

  croppedCanvas.width = cropAreaPixels.width;
  croppedCanvas.height = cropAreaPixels.height;

  croppedContext.drawImage(
    canvas,
    cropAreaPixels.x,
    cropAreaPixels.y,
    cropAreaPixels.width,
    cropAreaPixels.height,
    0,
    0,
    cropAreaPixels.width,
    cropAreaPixels.height,
  );

  const blob = await CanvasToBlob(croppedCanvas, mimeType);

  return new File([blob], fileName, {
    type: mimeType,
    lastModified: Date.now(),
  });
}

export function ReadFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function LoadImage(sourceImageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = sourceImageUrl;
  });
}

function CanvasToBlob(canvas: HTMLCanvasElement, mimeType: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to export cropped image."));
        return;
      }

      resolve(blob);
    }, mimeType);
  });
}

function DegreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function GetRotatedBounds(width: number, height: number, radians: number) {
  return {
    width:
      Math.abs(Math.cos(radians) * width) +
      Math.abs(Math.sin(radians) * height),
    height:
      Math.abs(Math.sin(radians) * width) +
      Math.abs(Math.cos(radians) * height),
  };
}
