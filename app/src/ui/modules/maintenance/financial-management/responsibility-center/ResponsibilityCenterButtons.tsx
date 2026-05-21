import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type IconProps = {
	icon: LucideIcon;
	label: string;
};

type ButtonProps = IconProps & {
	onClick?: () => void;
	type?: "button" | "submit";
};

type LinkProps = IconProps & {
	href: string;
};

export function ResponsibilityCenterPrimaryButton({
	icon: Icon,
	label,
	type = "button",
}: ButtonProps) {
	return (
		<button type={type} className={primaryButtonClassName}>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

export function ResponsibilityCenterDangerButton({
	icon: Icon,
	label,
	onClick,
}: ButtonProps) {
	return (
		<button type="button" onClick={onClick} className={dangerButtonClassName}>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

export function ResponsibilityCenterSecondaryLink({
	href,
	icon: Icon,
	label,
}: LinkProps) {
	return (
		<Link href={href} className={secondaryButtonClassName}>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</Link>
	);
}

export const iconButtonClassName =
	"flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

const primaryButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

const secondaryButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

const dangerButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink shadow-sm transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30";
