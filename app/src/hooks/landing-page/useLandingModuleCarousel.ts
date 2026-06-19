"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValue } from "framer-motion";

const CarouselSpeed = 0.035;

function wrapPosition(value: number, width: number) {
	if (width <= 0) return value;
	return ((value % width) + width) % width - width;
}

export function useLandingModuleCarousel() {
	const trackRef = useRef<HTMLDivElement>(null);
	const trackHalfWidthRef = useRef(0);
	const isDraggingRef = useRef(false);
	const x = useMotionValue(0);

	useEffect(() => {
		const trackElement = trackRef.current;
		if (!trackElement) return;

		function updateTrackWidth() {
			const currentTrack = trackRef.current;
			if (!currentTrack) return;
			trackHalfWidthRef.current = currentTrack.scrollWidth / 2;
			x.set(wrapPosition(x.get(), trackHalfWidthRef.current));
		}

		updateTrackWidth();
		const resizeObserver = new ResizeObserver(updateTrackWidth);
		resizeObserver.observe(trackElement);

		return () => resizeObserver.disconnect();
	}, [x]);

	useAnimationFrame((_, delta) => {
		if (isDraggingRef.current || trackHalfWidthRef.current === 0) return;

		x.set(
			wrapPosition(
				x.get() - delta * CarouselSpeed,
				trackHalfWidthRef.current,
			),
		);
	});

	function handleDragStart() {
		isDraggingRef.current = true;
	}

	function handleDragEnd() {
		x.set(wrapPosition(x.get(), trackHalfWidthRef.current));
		isDraggingRef.current = false;
	}

	return { trackRef, x, handleDragStart, handleDragEnd };
}
