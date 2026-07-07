import {
	forwardRef,
	useId,
	type ComponentProps,
} from "react";
import {
	FormField,
	textControlClassName,
	type BaseFieldProps,
} from "@/app/src/ui/shared/FormField/FormField";

export type TextFieldProps = BaseFieldProps &
	Omit<ComponentProps<"input">, "className" | "id">;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
	function TextField(
		{
			className,
			controlClassName = "",
			error,
			helper,
			id,
			label,
			required,
			success,
			warning,
			...props
		},
		ref,
	) {
		const generatedId = useId();
		const inputId = id ?? generatedId;

		return (
			<FormField
				className={className}
				error={error}
				helper={helper}
				htmlFor={inputId}
				label={label}
				required={required}
				success={success}
				warning={warning}
			>
				<input
					ref={ref}
					id={inputId}
					className={`${textControlClassName} ${controlClassName}`.trim()}
					{...props}
				/>
			</FormField>
		);
	},
);
