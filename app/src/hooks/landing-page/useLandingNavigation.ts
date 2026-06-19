"use client";

import { useState } from "react";

export function useLandingNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((isOpen) => !isOpen);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return { isMenuOpen, toggleMenu, closeMenu };
}
