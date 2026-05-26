"use client";

import { useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { LoaderCircle, RotateCw, Search } from "lucide-react";
import { CreateCroppedImageFile } from "@/app/src/services/shared/media/ImageCropper";

type ImageCropDialogProps = {
  aspect: number;
  cropShape?: "rect" | "round";
  fileName: string;
  isOpen: boolean;
  mimeType: string;
  sourceImageUrl: string;
  title: string;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
};

type ImageCropDialogContentProps = Omit<ImageCropDialogProps, "isOpen">;

export function ImageCropDialog({
  aspect,
  cropShape = "rect",
  fileName,
  isOpen,
  mimeType,
  sourceImageUrl,
  title,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ImageCropDialogContent
      key={sourceImageUrl}
      aspect={aspect}
      cropShape={cropShape}
      fileName={fileName}
      mimeType={mimeType}
      sourceImageUrl={sourceImageUrl}
      title={title}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

function ImageCropDialogContent({
  aspect,
  cropShape = "rect",
  fileName,
  mimeType,
  sourceImageUrl,
  title,
  onCancel,
  onConfirm,
}: ImageCropDialogContentProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleConfirm() {
    if (!croppedAreaPixels) {
      return;
    }

    setIsSaving(true);

    try {
      const croppedFile = await CreateCroppedImageFile({
        cropAreaPixels: croppedAreaPixels,
        fileName,
        mimeType,
        rotation,
        sourceImageUrl,
      });

      await onConfirm(croppedFile);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-80 flex items-center justify-center bg-darknavy/65 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-dialog-title"
        className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.32)]"
      >
        <div className="border-b border-darknavy/10 px-5 py-4 sm:px-6">
          <h2
            id="image-crop-dialog-title"
            className="text-lg font-semibold text-darknavy"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-darknavy/60">
            Adjust the crop, zoom, and rotation before saving.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="relative min-h-[22rem] bg-darknavy sm:min-h-[28rem]">
            <Cropper
              image={sourceImageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={cropShape}
              showGrid
              objectFit="contain"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, areaPixels) => {
                setCroppedAreaPixels(areaPixels);
              }}
            />
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <SliderField
              icon={Search}
              label="Zoom"
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              displayValue={`${Math.round(zoom * 100)}%`}
              onChange={(value) => setZoom(Number(value))}
            />

            <SliderField
              icon={RotateCw}
              label="Rotation"
              value={rotation}
              min={0}
              max={360}
              step={1}
              displayValue={`${Math.round(rotation)}°`}
              onChange={(value) => setRotation(Number(value))}
            />

            <div className="rounded-2xl border border-darknavy/10 bg-offwhite/70 px-4 py-3 text-sm leading-6 text-darknavy/62">
              Tip: use zoom to focus the subject, then rotate if the image needs leveling before saving.
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!croppedAreaPixels || isSaving}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/92 disabled:cursor-not-allowed disabled:bg-darknavy/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving Crop
                  </>
                ) : (
                  "Use Cropped Image"
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SliderField({
  displayValue,
  icon: Icon,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  displayValue: string;
  icon: typeof Search;
  label: string;
  max: number;
  min: number;
  onChange: (value: string) => void;
  step: number;
  value: number;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-darknavy">
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4 text-darknavy/55" aria-hidden="true" />
          {label}
        </span>
        <span className="text-xs font-medium text-darknavy/55">{displayValue}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-darknavy/12 accent-darknavy"
      />
    </label>
  );
}
