import type { ReactNode } from "react";

type ResponsibilityCenterFormFieldProps = {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
};

export function ResponsibilityCenterFormField({
	children,
	className,
	error,
	label,
	required,
}: ResponsibilityCenterFormFieldProps) {
	return (
		<label className={className}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

export const responsibilityCenterFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
