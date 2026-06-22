import { ArrowDown, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";

type OnboardingActionRowProps = {
	showBack: boolean;
	primaryLabel?: string;
	primaryVariant?: "default" | "circle";
	isPending?: boolean;
	onPrimary: () => void;
	onBack: () => void;
};

export function OnboardingActionRow({
	showBack,
	primaryLabel,
	primaryVariant = "default",
	isPending = false,
	onPrimary,
	onBack,
}: OnboardingActionRowProps) {
	const isCirclePrimary = primaryVariant === "circle";

	return (
		<div className={showBack && !isCirclePrimary ? "flex flex-col-reverse gap-3 border-t border-darknavy/10 pt-6 sm:flex-row sm:justify-end" : "flex justify-center"}>
			{showBack ? (
				<button
					type="button"
					onClick={onBack}
					disabled={isPending}
					className="flex h-12 min-w-32 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-5 text-sm font-semibold text-darknavy transition hover:border-darknavy/20 hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-60"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</button>
			) : null}

			{isCirclePrimary ? (
				<button
					type="button"
					onClick={onPrimary}
					disabled={isPending}
					className="flex h-12 w-12 items-center justify-center rounded-full bg-darknavy text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isPending ? (
						<LoaderCircle
							className="h-5 w-5 animate-spin"
							aria-hidden="true"
						/>
					) : (
						<ArrowDown className="h-4 w-4" />
					)}
				</button>
			) : (
				<button
					type="button"
					onClick={onPrimary}
					disabled={isPending}
					className="flex h-12 min-w-40 items-center justify-center gap-2 rounded-lg bg-darknavy px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(33,39,56,0.18)] transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span>{isPending ? "Saving..." : (primaryLabel ?? "Continue")}</span>
					{isPending ? (
						<LoaderCircle
							className="h-5 w-5 animate-spin"
							aria-hidden="true"
						/>
					) : (
						<ArrowRight className="h-4 w-4" />
					)}
				</button>
			)}
		</div>
	);
}
