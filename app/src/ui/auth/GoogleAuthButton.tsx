"use client";

import Image from "next/image";
import { BuildAuthApiUrl } from "@/app/src/services/auth/AuthApi";

type GoogleAuthButtonProps = {
  disabled?: boolean;
};

export function GoogleAuthButton({
  disabled = false,
}: GoogleAuthButtonProps) {
  function handleClick() {
    window.location.assign(BuildAuthApiUrl("/auth/google"));
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-darknavy/30 bg-white px-4 text-sm font-medium text-darknavy transition hover:border-darknavy/50 hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span>Continue with Google</span>
      <Image
        src="/img/google-icon.png"
        alt="Google icon"
        width={18}
        height={18}
      />
    </button>
  );
}
