import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { BadgeCheck } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

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
						className="ml-2 inline h-5 w-5 align-middle text-blue-600"
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
		"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 shadow-sm shadow-darknavy/5 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15",
	primary:
		"inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20",
	secondary:
		"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/75 shadow-sm shadow-darknavy/5 transition hover:border-skyblue/35 hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
};

const moduleHeaderVariantClassNames = {
	card: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
	panel: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
	plain: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
};

const moduleHeaderTitleClassNames = {
	card: "text-[1.9rem] font-semibold leading-tight text-darknavy sm:text-3xl",
	panel: "text-[1.9rem] font-semibold leading-tight text-darknavy sm:text-3xl",
	plain: "text-[1.9rem] font-semibold leading-tight text-darknavy sm:text-3xl",
};

const moduleHeaderDescriptionClassNames = {
	card: "mt-2 max-w-2xl text-sm leading-6 text-darknavy/65",
	panel: "mt-2 max-w-2xl text-sm leading-6 text-darknavy/65",
	plain: "mt-2 max-w-2xl text-sm leading-6 text-darknavy/65",
};
