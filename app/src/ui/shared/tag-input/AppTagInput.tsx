"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

type AppTagInputProps = {
	emptyLabel?: string;
	isReadonly?: boolean;
	placeholder?: string;
	tags: string[];
	onAddTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
};

export function AppTagInput({
	emptyLabel = "No tags",
	isReadonly = false,
	onAddTag,
	onRemoveTag,
	placeholder = "Type tag and press Enter",
	tags,
}: AppTagInputProps) {
	const [draftTag, setDraftTag] = useState("");

	function commitTag() {
		onAddTag(draftTag);
		setDraftTag("");
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Enter") {
			return;
		}

		event.preventDefault();
		commitTag();
	}

	return (
		<div className="rounded-md border border-darknavy/15 bg-white px-3 py-2">
			<div className="flex min-h-7 flex-wrap items-center gap-2">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md bg-skyblue/15 px-2.5 text-xs font-semibold text-darknavy"
					>
						<span className="truncate">{tag}</span>
						{!isReadonly ? (
							<button
								type="button"
								onClick={() => onRemoveTag(tag)}
								aria-label={`Remove ${tag}`}
								className="text-darknavy/55 transition hover:text-darknavy"
							>
								<X className="h-3 w-3" aria-hidden="true" />
							</button>
						) : null}
					</span>
				))}
				{!isReadonly ? (
					<input
						value={draftTag}
						onBlur={() => {
							if (draftTag.trim()) {
								commitTag();
							}
						}}
						onChange={(event) => setDraftTag(event.target.value)}
						onKeyDown={handleKeyDown}
						className="h-7 min-w-36 flex-1 bg-transparent text-sm font-medium text-darknavy outline-none placeholder:text-darknavy/35"
						placeholder={placeholder}
					/>
				) : null}
				{isReadonly && tags.length === 0 ? (
					<span className="text-sm text-darknavy/35">{emptyLabel}</span>
				) : null}
			</div>
		</div>
	);
}
