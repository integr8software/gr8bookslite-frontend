"use client";

import { useCallback, useEffect, useState } from "react";

export function useBackToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		function updateVisibility() {
			setIsVisible(window.scrollY > 480);
		}

		updateVisibility();
		window.addEventListener("scroll", updateVisibility, { passive: true });

		return () => window.removeEventListener("scroll", updateVisibility);
	}, []);

	const scrollToTop = useCallback(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	return { isVisible, scrollToTop };
}
