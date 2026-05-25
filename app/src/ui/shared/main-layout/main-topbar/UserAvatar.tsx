import { UserCircle } from "lucide-react";
import type { MainTopbarUser } from "@/app/src/types/shared/MainTopbarTypes";
import { ImageSwatch } from "@/app/src/ui/shared/main-layout/main-topbar/ImageSwatch";
import { joinClasses } from "@/app/src/ui/shared/main-layout/main-topbar/utils";

type UserAvatarProps = {
  currentUser: MainTopbarUser;
  className: string;
};

export function UserAvatar({ currentUser, className }: UserAvatarProps) {
  if (currentUser.profileImageUrl) {
    return (
      <ImageSwatch
        imageUrl={currentUser.profileImageUrl}
        className={joinClasses("rounded-full", className)}
      />
    );
  }

  return (
    <span
      className={joinClasses(
        "flex shrink-0 items-center justify-center rounded-full bg-skyblue/25 text-darknavy",
        className,
      )}
    >
      <UserCircle className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}
