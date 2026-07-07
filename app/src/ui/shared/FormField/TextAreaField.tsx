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

export type TextAreaFieldProps = BaseFieldProps &
	Omit<ComponentProps<"textarea">, "className" | "id">;

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
	function TextAreaField(
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
		const textareaId = id ?? generatedId;

		return (
			<FormField
				className={className}
				error={error}
				helper={helper}
				htmlFor={textareaId}
				label={label}
				required={required}
				success={success}
				warning={warning}
			>
				<textarea
					ref={ref}
					id={textareaId}
					className={`${textControlClassName} min-h-24 py-3 ${controlClassName}`.trim()}
					{...props}
				/>
			</FormField>
		);
	},
);
