import { LogOut } from "lucide-react";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export function LogoutLoadingScreen() {
	return (
		<main className="flex min-h-screen items-center justify-center overflow-hidden bg-offwhite px-6 py-10 text-darknavy">
			<section
				className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-darknavy/10 bg-white px-6 py-10 text-center shadow-[0_24px_70px_rgba(33,39,56,0.12)] sm:px-10"
				aria-busy="true"
				aria-live="polite"
			>
				<div className="text-2xl font-semibold tracking-tight text-darknavy">
					<LogoText brandSuffixClassName="text-base" />
				</div>

				<div className="relative mt-10 flex h-24 w-24 items-center justify-center">
					<div className="absolute inset-0 animate-ping rounded-full bg-skyblue/15 motion-reduce:animate-none" />
					<div className="absolute inset-2 animate-pulse rounded-full bg-skyblue/15 motion-reduce:animate-none" />
					<div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--skyblue)] text-white shadow-[0_16px_36px_rgb(var(--skyblue-rgb)/0.3)]">
						<LogOut className="h-7 w-7" aria-hidden="true" />
					</div>
				</div>

				<h1 className="mt-8 text-lg font-semibold text-darknavy">
					Logging you out
				</h1>
				<p className="mt-2 text-sm font-medium leading-6 text-darknavy/60">
					Keeping your books and inventory ready for your next visit.
				</p>
				<div className="mt-7 h-1.5 w-full overflow-hidden rounded-full bg-darknavy/8">
					<div className="h-full w-1/2 animate-[gr8-logout-progress_1.1s_ease-in-out_infinite] rounded-full bg-[var(--skyblue)] motion-reduce:animate-pulse" />
				</div>
			</section>
		</main>
	);
}
