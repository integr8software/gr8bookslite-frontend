import type { ReactNode } from "react";

export type FieldMessageTone = "error" | "helper" | "success" | "warning";

export type FormFieldProps = {
	children: ReactNode;
	className?: string;
	error?: string;
	helper?: string;
	htmlFor?: string;
	label: string;
	required?: boolean;
	success?: string;
	warning?: string;
};

export type BaseFieldProps = Omit<FormFieldProps, "children" | "htmlFor"> & {
	controlClassName?: string;
	id?: string;
};

export const textControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03] disabled:text-darknavy/70 disabled:placeholder:text-darknavy/32 read-only:bg-darknavy/[0.03] read-only:text-darknavy/70";

export function FormField({
	children,
	className,
	error,
	helper,
	htmlFor,
	label,
	required,
	success,
	warning,
}: FormFieldProps) {
	const message = error ?? warning ?? success ?? helper;
	const messageTone: FieldMessageTone | undefined = error
		? "error"
		: warning
			? "warning"
			: success
				? "success"
				: helper
					? "helper"
					: undefined;

	return (
		<div className={className}>
			<label
				htmlFor={htmlFor}
				className="mb-2 block text-sm font-semibold text-darknavy"
			>
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</label>
			{children}
			{message ? (
				<span
					className={`mt-1 block text-xs font-medium ${getMessageClassName(
						messageTone,
					)}`}
				>
					{message}
				</span>
			) : null}
		</div>
	);
}

function getMessageClassName(tone?: FieldMessageTone) {
	switch (tone) {
		case "error":
			return "text-coralpink";
		case "success":
			return "text-emerald-700";
		case "warning":
			return "text-amber-600";
		default:
			return "text-darknavy/55";
	}
}
