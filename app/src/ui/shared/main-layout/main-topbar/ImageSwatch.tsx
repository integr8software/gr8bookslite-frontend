import { joinClasses } from "@/app/src/ui/shared/main-layout/main-topbar/utils";

type ImageSwatchProps = {
  imageUrl: string;
  className: string;
};

export function ImageSwatch({ imageUrl, className }: ImageSwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={joinClasses("block shrink-0 bg-cover bg-center", className)}
      style={{ backgroundImage: `url("${imageUrl}")` }}
    />
  );
}
