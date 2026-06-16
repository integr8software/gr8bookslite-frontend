"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { joinClasses } from "@/app/src/ui/shared/main-layout/main-topbar/utils";

type ImageSwatchProps = {
	children?: ReactNode;
	className: string;
	imageUrl?: string;
};

export function ImageSwatch({
	children,
	className,
	imageUrl,
}: ImageSwatchProps) {
	return (
		<span
			aria-hidden="true"
			className={joinClasses(
				"relative flex shrink-0 items-center justify-center overflow-hidden text-darknavy",
				className,
			)}
		>
			{imageUrl ? (
				<Image
					src={imageUrl}
					alt=""
					fill
					fetchPriority="high"
					loading="eager"
					preload
					sizes="36px"
					unoptimized
					className="absolute inset-0 h-full w-full object-cover"
				/>
			) : (
				children
			)}
		</span>
	);
}
