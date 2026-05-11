import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

type OnboardingActionRowProps = {
	showBack: boolean;
	primaryLabel?: string;
	primaryVariant?: "default" | "circle";
	onPrimary: () => void;
	onBack: () => void;
};

export function OnboardingActionRow({
	showBack,
	primaryLabel,
	primaryVariant = "default",
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
					className="flex h-14 items-center justify-center gap-2 rounded-sm border border-darknavy/20 bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-offwhite"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</button>
			) : null}

			{isCirclePrimary ? (
				<button
					type="button"
					onClick={onPrimary}
					className="flex h-12 w-12 items-center justify-center rounded-full bg-darknavy text-offwhite transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/50 animate-bounce-once"
				>
					<ArrowDown className="h-4 w-4" />
				</button>
			) : (
				<button
					type="button"
					onClick={onPrimary}
					className="flex h-14 items-center justify-center gap-2 rounded-sm bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/90"
				>
					<span>{primaryLabel ?? "Continue"}</span>
					<ArrowRight className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}
