import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleNotFoundProps<TTitleElement extends ElementType = "h2"> =
	ComponentPropsWithoutRef<"section"> & {
		actionHref?: string;
		actionIcon?: ReactNode;
		actionLabel?: ReactNode;
		align?: "left" | "center";
		description?: ReactNode;
		descriptionClassName?: string;
		icon?: ReactNode;
		iconClassName?: string;
		title: ReactNode;
		titleAs?: TTitleElement;
		titleClassName?: string;
	};

export function ModuleNotFound<TTitleElement extends ElementType = "h2">({
	actionHref,
	actionIcon,
	actionLabel,
	align = "left",
	className,
	description,
	descriptionClassName,
	icon,
	iconClassName,
	title,
	titleAs,
	titleClassName,
	...props
}: ModuleNotFoundProps<TTitleElement>) {
	const Title = titleAs ?? "h2";
	const resolvedActionIcon = actionIcon ?? (
		<ArrowLeft className="h-4 w-4" aria-hidden="true" />
	);

	return (
		<section
			className={joinClasses(
				"rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm",
				align === "center" ? "text-center" : "",
				className,
			)}
			{...props}
		>
			{icon ? (
				<div
					className={joinClasses(
						"mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-skyblue/15 text-darknavy",
						align === "center" ? "mx-auto" : "",
						iconClassName,
					)}
				>
					{icon}
				</div>
			) : null}
			<Title
				className={joinClasses(
					"text-lg font-semibold text-darknavy",
					titleClassName,
				)}
			>
				{title}
			</Title>
			{description ? (
				<p
					className={joinClasses(
						"mt-2 text-sm text-darknavy/65",
						descriptionClassName,
					)}
				>
					{description}
				</p>
			) : null}
			{actionHref && actionLabel ? (
				<Link
					href={actionHref}
					className={joinClasses(
						"mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy",
						align === "center" ? "" : "",
					)}
				>
					{resolvedActionIcon}
					{actionLabel}
				</Link>
			) : null}
		</section>
	);
}
