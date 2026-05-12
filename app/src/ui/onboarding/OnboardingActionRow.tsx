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
		<div
			className={
				showBack && !isCirclePrimary
					? "grid gap-4 md:grid-cols-2"
					: "flex justify-center"
			}
		>
			{showBack ? (
				<button
					type="button"
					onClick={onBack}
					disabled={isPending}
					className="flex h-14 items-center justify-center gap-2 rounded-sm border border-darknavy/20 bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-offwhite disabled:cursor-not-allowed disabled:opacity-60"
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
					className="flex h-12 w-12 items-center justify-center rounded-full bg-darknavy text-offwhite transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/50 animate-bounce-once"
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
					className="flex h-14 items-center justify-center gap-2 rounded-sm bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/50"
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
