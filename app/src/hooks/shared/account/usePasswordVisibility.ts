"use client";

import { useState } from "react";
import type { HTMLInputTypeAttribute } from "react";

export function usePasswordVisibility(type?: HTMLInputTypeAttribute) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && isPasswordVisible ? "text" : type;

  function togglePasswordVisibility() {
    setIsPasswordVisible((current) => !current);
  }

  return {
    isPassword,
    inputType,
    isPasswordVisible,
    togglePasswordVisibility,
  };
}
