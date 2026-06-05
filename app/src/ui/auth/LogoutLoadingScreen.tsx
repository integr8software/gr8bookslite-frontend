import { Power } from "lucide-react";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export function LogoutLoadingScreen() {
	return (
		<main className="flex min-h-screen items-center justify-center overflow-hidden bg-offwhite px-6 py-10 text-darknavy">
			<section
				className="flex w-full max-w-sm flex-col items-center rounded-lg border border-darknavy/10 bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(33,39,56,0.12)] sm:px-10"
				aria-busy="true"
				aria-live="polite"
			>
				<div className="text-2xl font-semibold text-darknavy">
					<LogoText brandSuffixClassName="text-base" />
				</div>

				<div className="relative mt-10 h-36 w-44" aria-hidden="true">
					<div className="absolute inset-x-8 bottom-3 h-4 rounded-full bg-darknavy/10 blur-md" />
					<div className="absolute left-1/2 top-0 h-25 w-40 -translate-x-1/2 rounded-lg border border-darknavy/12 bg-darknavy/12 p-2 shadow-[0_24px_60px_rgba(33,39,56,0.16)]">
						<div className="logout-shutdown-screen relative h-full overflow-hidden rounded-md bg-darknavy">
							<div className="logout-shutdown-glow absolute inset-0" />
							<div className="logout-shutdown-scanline absolute inset-x-0 h-10" />
							<div className="logout-shutdown-collapse absolute left-1/2 top-1/2 h-1 w-24 rounded-full bg-skyblue" />
							<Power className="logout-shutdown-power absolute left-1/2 top-1/2 h-10 w-10 text-skyblue" />
						</div>
					</div>
					<div className="absolute bottom-8 left-1/2 h-8 w-4 -translate-x-1/2 rounded-b-sm bg-darknavy/14" />
					<div className="absolute bottom-5 left-1/2 h-3 w-22 -translate-x-1/2 rounded-md bg-darknavy/14" />
				</div>

				<h1 className="mt-8 text-lg font-semibold text-darknavy">
					Logging you out
				</h1>
				<p className="mt-2 text-sm font-medium leading-6 text-darknavy/60">
					Signing you out safely and closing your workspace session.
				</p>
			</section>
		</main>
	);
}
