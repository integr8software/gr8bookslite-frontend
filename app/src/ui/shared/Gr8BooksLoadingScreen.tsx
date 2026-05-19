import { AppName } from "@/app/src/constants/shared/AppConstants";

type Gr8BooksLoadingScreenProps = {
	message?: string;
};

export function Gr8BooksLoadingScreen({
	message = "Opening your workspace...",
}: Gr8BooksLoadingScreenProps) {
	return (
		<main className="flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-10 text-darknavy">
			<section
				className="flex w-full max-w-sm flex-col items-center text-center"
				aria-busy="true"
				aria-live="polite"
			>
				<div className="text-2xl font-semibold tracking-tight text-darknavy">
					<span>Gr8Books</span>
					<span className="ml-1 text-base font-medium italic text-skyblue">
						Lite
					</span>
				</div>

				<div className="relative mt-10 h-36 w-44 perspective-distant">
					<div className="absolute inset-x-4 bottom-0 h-4 rounded-full bg-darknavy/10 blur-md" />
					<div className="absolute left-1/2 top-4 h-28 w-36 -translate-x-1/2 rounded-md bg-darknavy/12 shadow-[0_24px_60px_rgba(33,39,56,0.16)]" />
					<div className="absolute left-1/2 top-0 h-30 w-32 -translate-x-1/2 rounded-md border border-darknavy/10 bg-white shadow-[0_18px_50px_rgba(33,39,56,0.18)]">
						<div className="absolute left-1/2 top-0 h-full w-px bg-darknavy/12" />
						<div className="absolute left-3 right-18 top-5 h-1 rounded-full bg-skyblue/70" />
						<div className="absolute left-3 right-20 top-9 h-1 rounded-full bg-darknavy/12" />
						<div className="absolute left-3 right-17 top-13 h-1 rounded-full bg-darknavy/10" />
						<div className="absolute left-18 right-3 top-6 h-1 rounded-full bg-citron/80" />
						<div className="absolute left-20 right-3 top-10 h-1 rounded-full bg-darknavy/12" />
						<div className="absolute left-18 right-3 top-14 h-1 rounded-full bg-darknavy/10" />
					</div>
					<div className="absolute left-1/2 top-0 h-30 w-16 origin-left animate-[gr8-page-turn_1.45s_ease-in-out_infinite] rounded-r-md border-y border-r border-darknavy/10 bg-white shadow-[12px_12px_28px_rgba(33,39,56,0.14)]">
						<div className="absolute left-4 right-3 top-6 h-1 rounded-full bg-coralpink/75" />
						<div className="absolute left-4 right-5 top-10 h-1 rounded-full bg-darknavy/12" />
						<div className="absolute left-4 right-3 top-14 h-1 rounded-full bg-darknavy/10" />
					</div>
					<div className="absolute left-1/2 top-0 h-30 w-16 origin-left animate-[gr8-page-turn_1.45s_ease-in-out_0.32s_infinite] rounded-r-md border-y border-r border-darknavy/8 bg-white shadow-[10px_10px_24px_rgba(33,39,56,0.1)]" />
				</div>

				<p className="mt-8 text-sm font-semibold text-darknavy">
					{message}
				</p>
				<p className="mt-2 text-xs leading-5 text-darknavy/55">
					Preparing {AppName} for your branch, books, and reports.
				</p>
			</section>
		</main>
	);
}
