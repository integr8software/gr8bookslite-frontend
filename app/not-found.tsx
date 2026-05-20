"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

function OrbitStars() {
	const starsRef = useRef<(HTMLSpanElement | null)[]>([]);
	const frameRef = useRef<number>(0);
	const startTime = useRef<number>(0);

	useEffect(() => {
		startTime.current = Date.now();
		const STARS = 5;
		const RX = 48; // horizontal radius — tweak to widen/narrow orbit
		const RY = 18; // vertical radius — tweak for more/less 3D depth
		const PERIOD = 2600; // ms per full rotation

		function tick() {
			const elapsed = Date.now() - startTime.current;
			starsRef.current.forEach((el, i) => {
				if (!el) return;
				const angle =
					(elapsed / PERIOD) * Math.PI * 2 +
					(i / STARS) * Math.PI * 2;
				const x = Math.cos(angle) * RX;
				const y = Math.sin(angle) * RY;
				el.style.transform = `translate(${x}px, ${y}px)`;
				el.style.opacity = y > 0 ? "1" : "0.4";
				el.style.zIndex = y > 0 ? "30" : "20";
			});
			frameRef.current = requestAnimationFrame(tick);
		}

		frameRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frameRef.current);
	}, []);

	return (
		<div
			style={{
				position: "absolute",
				top: "-10px",
				left: "40%",
				width: "0",
				height: "0",
				transform: "translateX(-50%)",
				pointerEvents: "none",
				zIndex: 30,
			}}
		>
			{[...Array(5)].map((_, i) => (
				<span
					key={i}
					ref={(el) => {
						starsRef.current[i] = el;
					}}
					style={{
						position: "absolute",
						fontSize: "24px",
						color: "#ffb400",
						textShadow:
							"0 0 8px rgba(255,180,0,0.8), 0 0 14px rgba(255,180,0,0.4)",
						transform: "translate(0px, 0px)",
						transition: "opacity 0.1s",
					}}
				>
					★
				</span>
			))}
		</div>
	);
}

export default function NotFound() {
	return (
		<main className="relative h-screen w-screen overflow-hidden bg-[#f6eee2] max-lg:flex max-lg:h-dvh max-lg:flex-col max-lg:items-center max-lg:justify-end">
			<Image
				src="/404/bg.png"
				alt="404 library background"
				fill
				priority
				quality={100}
				sizes="100vw"
				className="object-cover object-center"
			/>

			{/* Penguin Shadow */}
			<div className="absolute left-[51%] top-[78%] z-10 h-5.5 w-45 -translate-x-1/2 rounded-full bg-black/75 blur-md max-lg:hidden" />

			{/* Penguin - desktop only */}
			<div className="absolute left-1/2 top-[68%] z-20 w-[23vw] min-w-57.5 max-w-92.5 -translate-x-1/2 -translate-y-1/2 max-lg:hidden">
				<div className="penguin-layer relative">
					<OrbitStars />
					<Image
						src="/404/penguin.png"
						alt="Dizzy penguin"
						width={900}
						height={900}
						priority
						className="h-auto w-full"
					/>
				</div>
			</div>

			{/* Buttons */}
			<div className="absolute -bottom-6.25 left-1/2 z-30 flex w-full -translate-x-1/2 justify-center gap-[2.6vw] px-5 max-lg:static max-lg:flex-col max-lg:items-center max-lg:gap-2 max-lg:px-6 max-lg:pb-0 max-lg:translate-x-0 max-sm:pb-6">
				{/* Penguin - tablet + mobile, above buttons */}
				<div className="hidden max-lg:block w-70 max-sm:w-50 mx-auto mb-1 relative">
					<OrbitStars />
					<Image
						src="/404/penguin.png"
						alt="Dizzy penguin"
						width={900}
						height={900}
						priority
						className="h-auto w-full"
					/>
				</div>

				<Link
					href="/"
					className="button-img relative w-[23vw] min-w-70 max-w-106.25 max-lg:h-29.5 max-lg:w-[58vw] max-lg:min-w-60 max-lg:max-w-90 max-lg:overflow-hidden max-sm:h-26 max-sm:w-[78vw] max-sm:min-w-0 max-sm:max-w-77.5"
				>
					<div className="absolute left-1/2 top-[68%] z-0 h-4.5 w-[72%] -translate-x-1/2 rounded-full bg-black/75 blur-[10px] max-lg:hidden" />
					<Image
						src="/404/return-home.png"
						alt="Return Home"
						width={1000}
						height={300}
						className="relative z-10 h-auto w-full max-lg:absolute max-lg:left-1/2 max-lg:top-1/2 max-lg:w-[138%] max-lg:max-w-none max-lg:-translate-x-1/2 max-lg:-translate-y-1/2"
					/>
				</Link>

				<a
					href="mailto:legal@gr8booklite.com"
					className="button-img relative w-[23vw] min-w-70 max-w-106.25 max-lg:h-29.5 max-lg:w-[58vw] max-lg:min-w-60 max-lg:max-w-90 max-lg:overflow-hidden max-sm:h-26 max-sm:w-[78vw] max-sm:min-w-0 max-sm:max-w-77.5"
				>
					<div className="absolute left-1/2 top-[68%] z-0 h-4.5 w-[72%] -translate-x-1/2 rounded-full bg-black/75 blur-[10px] max-lg:hidden" />
					<Image
						src="/404/contact-us.png"
						alt="Contact Us"
						width={1000}
						height={300}
						className="relative z-10 h-auto w-full max-lg:absolute max-lg:left-1/2 max-lg:top-1/2 max-lg:w-[138%] max-lg:max-w-none max-lg:-translate-x-1/2 max-lg:-translate-y-1/2"
					/>
				</a>
			</div>
		</main>
	);
}
