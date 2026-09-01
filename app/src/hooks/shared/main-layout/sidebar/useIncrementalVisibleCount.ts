"use client";

import { useCallback, useEffect, useState } from "react";

export function useIncrementalVisibleCount(
	totalItems: number,
	initialCount: number,
	batchSize: number,
	isEnabled: boolean,
) {
	const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
	const [visibleCount, setVisibleCount] = useState(() =>
		Math.min(totalItems, initialCount),
	);
	const sentinelRef = useCallback((node: HTMLDivElement | null) => {
		setSentinelNode(node);
	}, []);
	const clampedVisibleCount = Math.min(
		Math.max(visibleCount, initialCount),
		totalItems,
	);

	useEffect(() => {
		if (!isEnabled || clampedVisibleCount >= totalItems || !sentinelNode) {
			return;
		}

		if (typeof IntersectionObserver === "undefined") {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) {
					return;
				}

				setVisibleCount((current) => Math.min(totalItems, current + batchSize));
			},
			{ rootMargin: "160px 0px" },
		);

		observer.observe(sentinelNode);

		return () => {
			observer.disconnect();
		};
	}, [batchSize, clampedVisibleCount, isEnabled, sentinelNode, totalItems]);

	return [
		clampedVisibleCount,
		clampedVisibleCount < totalItems,
		sentinelRef,
	] as const;
}
