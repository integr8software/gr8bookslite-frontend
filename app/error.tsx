"use client";

import { AnimatedErrorPage } from "@/app/src/ui/shared/app/AnimatedErrorPage";
import { useEffect } from "react";

export default function Error({
	error,
}: {
	error: Error & { digest?: string };
	reset?: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <AnimatedErrorPage variant="500" />;
}
