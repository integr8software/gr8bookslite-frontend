"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useLogout } from "@/app/src/hooks/auth/useLogout";

type LogoutButtonProps = {
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "children" | "type" | "onClick">;

export function LogoutButton({
  children,
  className,
  ...props
}: LogoutButtonProps) {
  const logout = useLogout();

  return (
    <button
      type="button"
      onClick={() => {
        void logout();
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
