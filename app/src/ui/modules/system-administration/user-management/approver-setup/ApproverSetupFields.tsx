type ApproverSetupTextFieldProps = {
	label: string;
	onChange: (value: string) => void;
	type?: "date" | "number" | "text";
	value: string;
};

type ApproverSetupSelectFieldProps = {
	label: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	value: string;
};

export function ApproverSetupTextField({
	label,
	onChange,
	type = "text",
	value,
}: ApproverSetupTextFieldProps) {
	return (
		<label>
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="mt-2 h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/30 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
			/>
		</label>
	);
}

export function ApproverSetupSelectField({
	label,
	onChange,
	options,
	value,
}: ApproverSetupSelectFieldProps) {
	return (
		<label>
			<span className="text-sm font-semibold text-darknavy">{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="mt-2 h-10 w-full rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-4 focus:ring-skyblue/15"
			>
				{options.map((option) => (
					<option
						key={option.value || option.label}
						value={option.value}
					>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
