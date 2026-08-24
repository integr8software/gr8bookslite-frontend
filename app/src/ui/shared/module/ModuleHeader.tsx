import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { BadgeCheck } from "lucide-react";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

type ModuleHeaderVariant = "plain" | "card" | "panel";

type ModuleHeaderProps<TTitleElement extends ElementType = "h2"> =
	Omit<ComponentPropsWithoutRef<"div">, "title"> & {
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
	void eyebrowClassName;

	return (
		<div
			className={joinClasses(moduleHeaderVariantClassNames[variant], className)}
			{...props}
		>
			<div>
				{eyebrow ? <span className="sr-only">{eyebrow}</span> : null}
				<Title
					className={joinClasses(
						moduleHeaderTitleClassNames[variant],
						titleClassName,
					)}
				>
					{title}
					<BadgeCheck
						className={joinClasses(
							"ml-2 inline h-4 w-4 align-middle",
							moduleAccentClassNames.iconText,
						)}
						aria-hidden="true"
					/>
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
		"inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm shadow-darknavy/5 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15",
	primary:
		joinClasses(
			"inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold !text-[var(--skyblue-contrast)] shadow-sm transition focus-visible:outline-none focus-visible:ring-4",
			moduleAccentClassNames.button,
		),
	secondary:
		joinClasses(
			"inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/75 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4",
			moduleAccentClassNames.hoverBorder,
			moduleAccentClassNames.hoverSoftBackground,
			moduleAccentClassNames.focusRing,
		),
};

const moduleStatusActionButtonClassName =
	"inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-md border bg-white px-4 text-sm font-semibold shadow-sm shadow-darknavy/5 transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white";

export const moduleStatusActionClassNames = {
	approve: `${moduleStatusActionButtonClassName} border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/15`,
	cancel: `${moduleStatusActionButtonClassName} border-amber-200 text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-500/15`,
	danger: `${moduleStatusActionButtonClassName} border-coralpink/45 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`,
	disapprove: `${moduleStatusActionButtonClassName} border-red-200 text-red-600 hover:bg-red-50 focus-visible:ring-red-500/15`,
	undo: `${moduleStatusActionButtonClassName} border-skyblue/35 text-skyblue hover:bg-skyblue/15 focus-visible:ring-skyblue/20`,
} as const;

const moduleHeaderVariantClassNames = {
	card: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
	panel: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
	plain: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
};

const moduleHeaderTitleClassNames = {
	card: "text-xl font-semibold leading-tight text-darknavy sm:text-2xl",
	panel: "text-xl font-semibold leading-tight text-darknavy sm:text-2xl",
	plain: "text-xl font-semibold leading-tight text-darknavy sm:text-2xl",
};

const moduleHeaderDescriptionClassNames = {
	card: "mt-1.5 max-w-2xl text-sm leading-6 text-darknavy/65",
	panel: "mt-1.5 max-w-2xl text-sm leading-6 text-darknavy/65",
	plain: "mt-1.5 max-w-2xl text-sm leading-6 text-darknavy/65",
};
