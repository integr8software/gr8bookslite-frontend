"use client";

import { useState } from "react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ModuleDataEntryInlineRename({
	label,
	onCancel,
	onRename,
	variant = "default",
}: {
	label: string;
	onCancel: () => void;
	onRename: (label: string) => void;
	variant?: "default" | "header";
}) {
	const [value, setValue] = useState(label);

	function handleSave() {
		const nextLabel = value.trim();

		if (nextLabel) {
			onRename(nextLabel);
			return;
		}

		onCancel();
	}

	return (
		<input
			autoFocus
			id={`module-data-entry-inline-rename-${sanitizeInlineRenameId(label)}`}
			name="moduleDataEntryInlineRename"
			type="text"
			value={value}
			onBlur={onCancel}
			onChange={(event) => setValue(event.target.value)}
			onKeyDown={(event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					handleSave();
				}

				if (event.key === "Escape") {
					event.preventDefault();
					onCancel();
				}
			}}
			className={joinClasses(
				"app-theme-field min-w-0 flex-1 border text-xs font-semibold text-darknavy outline-none transition focus:border-skyblue/40 focus:ring-2 focus:ring-skyblue/15",
				variant === "header"
					? "-mx-2 h-9 w-[calc(100%+1rem)] rounded-none px-2"
					: "h-8 rounded-md px-2",
			)}
			aria-label={`Rename ${label} column`}
		/>
	);
}

function sanitizeInlineRenameId(value: string) {
	return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
