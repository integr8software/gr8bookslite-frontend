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
