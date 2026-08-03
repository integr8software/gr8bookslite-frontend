import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type PickListEntryTextInputProps = {
	id: string;
	name: string;
	onChange: (value: string) => void;
	readOnly: boolean;
	value: string;
};

export function PickListEntryTextInput({
	id,
	name,
	onChange,
	readOnly,
	value,
}: PickListEntryTextInputProps) {
	return (
		<input
			id={id}
			name={name}
			type="text"
			value={value}
			readOnly={readOnly}
			onChange={(event) => onChange(event.target.value)}
			className={pickListEntryCellControlClassName()}
		/>
	);
}

function pickListEntryCellControlClassName() {
	return joinClasses(
		"h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
	);
}
