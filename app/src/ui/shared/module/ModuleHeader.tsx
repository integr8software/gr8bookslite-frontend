import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleHeaderVariant = "plain" | "card" | "panel";

type ModuleHeaderProps<TTitleElement extends ElementType = "h2"> =
	ComponentPropsWithoutRef<"div"> & {
		actions?: ReactNode;
		actionsClassName?: string;
		description?: ReactNode;
		descriptionClassName?: string;
		eyebrow?: ReactNode;
		eyebrowClassName?: string;
		title: ReactNode;
		titleAs?: TTitleElement;
		titleClassName?: string;
		variant?: ModuleHeaderVariant;
	};

export function ModuleHeader<TTitleElement extends ElementType = "h2">({
	actions,
	actionsClassName,
	className,
	description,
	descriptionClassName,
	eyebrow,
	eyebrowClassName,
	title,
	titleAs,
	titleClassName,
	variant = "plain",
	...props
}: ModuleHeaderProps<TTitleElement>) {
	const Title = titleAs ?? "h2";

	return (
		<div
			className={joinClasses(moduleHeaderVariantClassNames[variant], className)}
			{...props}
		>
			<div>
				{eyebrow ? (
					<div
						className={joinClasses(
							moduleHeaderEyebrowClassNames[variant],
							eyebrowClassName,
						)}
					>
						{eyebrow}
					</div>
				) : null}
				<Title
					className={joinClasses(
						moduleHeaderTitleClassNames[variant],
						titleClassName,
					)}
				>
					{title}
				</Title>
				{description ? (
					<p
						className={joinClasses(
							moduleHeaderDescriptionClassNames[variant],
							descriptionClassName,
						)}
					>
						{description}
					</p>
				) : null}
			</div>
			{actions ? (
				<div className={joinClasses("flex flex-wrap gap-2", actionsClassName)}>
					{actions}
				</div>
			) : null}
		</div>
	);
}

export const moduleHeaderActionClassNames = {
	danger:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15",
	primary:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold text-white shadow-sm shadow-skyblue/20 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
	secondary:
		"inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
};

const moduleHeaderVariantClassNames = {
	card: "flex flex-col gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between",
	panel:
		"flex flex-col gap-4 self-start rounded-xl border border-darknavy/10 bg-white p-5 shadow-sm lg:h-36 lg:flex-row lg:items-center lg:justify-between",
	plain: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
};

const moduleHeaderEyebrowClassNames = {
	card: "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-darknavy/55",
	panel:
		"flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-skyblue",
	plain: "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-darknavy/55",
};

const moduleHeaderTitleClassNames = {
	card: "text-xl font-semibold text-darknavy",
	panel: "mt-2 text-2xl font-semibold text-darknavy sm:text-3xl",
	plain: "text-xl font-semibold text-darknavy",
};

const moduleHeaderDescriptionClassNames = {
	card: "mt-1 text-sm text-darknavy/55",
	panel: "mt-2 max-w-2xl text-sm text-darknavy/60",
	plain: "mt-1 text-sm text-darknavy/55",
};
