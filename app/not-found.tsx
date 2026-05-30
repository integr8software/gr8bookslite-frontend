"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function NotFound() {
	const animationRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		let cleanup404 = () => {};

		async function loadAnimations() {
			const lottieModule = await import("lottie-web");
			const lottie = lottieModule.default ?? lottieModule;

			if (animationRef.current) {
				const animation = lottie.loadAnimation({
					autoplay: true,
					container: animationRef.current,
					loop: true,
					path: "/404/404.json",
					renderer: "svg",
					rendererSettings: {
						preserveAspectRatio: "xMidYMid meet",
					},
				});
				cleanup404 = () => animation.destroy();
			}
		}

		void loadAnimations();
		return () => {
			cleanup404();
		};
	}, []);

	return (
		<main className="fixed inset-0 isolate flex h-dvh w-screen items-center justify-center overflow-hidden bg-[#f7fbff] px-6 py-8 text-[#132d35]">
			<div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(0,124,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,124,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
			<div className="absolute inset-x-0 top-0 -z-10 h-44 bg-[linear-gradient(180deg,rgba(0,124,255,0.13),rgba(247,251,255,0))]" />
			<div className="absolute -left-20 top-16 -z-10 h-48 w-48 rotate-12 border-[28px] border-[#007CFF]/10" />
			<div className="absolute -right-16 bottom-10 -z-10 h-56 w-56 -rotate-12 border-[32px] border-[#13b981]/10" />
			<div className="absolute left-8 top-8 hidden h-18 w-18 border-l-4 border-t-4 border-[#007CFF]/35 md:block" />
			<div className="absolute bottom-8 right-8 hidden h-18 w-18 border-b-4 border-r-4 border-[#ffb400]/45 md:block" />

			<section className="flex w-full max-w-5xl flex-col items-center text-center">
				<div
					ref={animationRef}
					aria-label="404 error animation"
					className="mt-2 h-[min(52dvh,500px)] w-[min(84vw,560px)] drop-shadow-[0_22px_45px_rgba(19,45,53,0.12)] [&>svg]:!h-full [&>svg]:!w-full"
				/>

				<h1 className="text-3xl font-bold text-[#132d35] sm:text-4xl">
					This page needs a quick repair.
				</h1>

				<p className="mt-3 max-w-xl text-sm leading-6 text-[#51656b] sm:text-base">
					The route you opened does not exist, or it may have moved
					while the workspace was updating.
				</p>

				<Link
					href="/"
					className="group relative mt-8 inline-flex items-center gap-2.5 rounded-xl bg-[#007CFF] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0066dd] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:ring-offset-2 active:translate-y-0"
				>
					{/* Gear animations — behind button, not inside */}
					<span className="pointer-events-none absolute -left-4 -top-4 -z-10 opacity-30 transition-opacity group-hover:opacity-60">
						<svg
							viewBox="0 0 24 24"
							fill="#007CFF"
							className="h-8 w-8 animate-spin [animation-duration:4s]"
							aria-hidden
						>
							<path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.4 7.4 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.4 7.4 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
						</svg>
					</span>
					<span className="pointer-events-none absolute -bottom-4 -right-5 -z-10 opacity-20 transition-opacity group-hover:opacity-50">
						<svg
							viewBox="0 0 24 24"
							fill="#007CFF"
							className="h-10 w-10 animate-spin [animation-duration:6s] [animation-direction:reverse]"
							aria-hidden
						>
							<path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.4 7.4 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.4 7.4 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
						</svg>
					</span>
					{/* Antenna — top left, tilted left */}
					{/* Antenna — top right, tilted right */}
					<span className="absolute -top-5 right-3 flex flex-col items-center rotate-[25deg] origin-bottom">
						<span className="h-2.5 w-2.5 rounded-full bg-[#ff3b3b] shadow-[0_0_6px_2px_rgba(255,59,59,0.5)] group-hover:animate-ping" />
						<span className="mt-0.5 h-5 w-[2.5px] rounded-full bg-white/80" />
					</span>
					{/* House icon */}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						className="h-4 w-4 shrink-0"
						aria-hidden
					>
						<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
					</svg>
					Return Home
					{/* Spinning gear — right of text */}
					<svg
						viewBox="0 0 24 24"
						fill="currentColor"
						className="h-4 w-4 shrink-0 transition-transform duration-700 group-hover:rotate-90"
						aria-hidden
					>
						<path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.4 7.4 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.4 7.4 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
					</svg>
				</Link>
			</section>
		</main>
	);
}
