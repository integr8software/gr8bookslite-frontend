"use client";

import { LoaderCircle, Upload } from "lucide-react";

type ClickOrDragDropFileProps = {
	accept?: string;
	acceptedFileLabel?: string;
	className?: string;
	disabled?: boolean;
	isBusy?: boolean;
	label?: string;
	multiple?: boolean;
	size?: "large" | "medium" | "short";
	stackable?: boolean;
	onFileSelect?: (file: File | undefined) => void;
	onFilesSelect?: (files: File[]) => void;
};

export function ClickOrDragDropFile({
	accept,
	acceptedFileLabel,
	className,
	disabled,
	isBusy,
	label = "Upload File",
	multiple = false,
	size = "short",
	stackable = false,
	onFileSelect,
	onFilesSelect,
}: ClickOrDragDropFileProps) {
	function handleFiles(fileList: FileList | null | undefined) {
		const files = Array.from(fileList ?? []);

		onFilesSelect?.(multiple ? files : files.slice(0, 1));
		onFileSelect?.(files[0]);
	}

	return (
		<label
			onDragOver={(event) => {
				if (!disabled) {
					event.preventDefault();
				}
			}}
			onDrop={(event) => {
				event.preventDefault();

				if (!disabled) {
					handleFiles(event.dataTransfer.files);
				}
			}}
			className={className ?? getDropFileClassName(size, stackable)}
		>
			{isBusy ? (
				<LoaderCircle
					className={getIconClassName(size, true)}
					aria-hidden="true"
				/>
			) : (
				<Upload className={getIconClassName(size)} aria-hidden="true" />
			)}
			<span className={stackable ? "grid gap-0.5" : undefined}>
				<span>{label}</span>
				{acceptedFileLabel ? (
					<span className={getAcceptedLabelClassName(size)}>
						{acceptedFileLabel}
					</span>
				) : null}
			</span>
			<input
				type="file"
				accept={accept}
				disabled={disabled}
				multiple={multiple}
				className="sr-only"
				onChange={(event) => {
					handleFiles(event.target.files);
					event.target.value = "";
				}}
			/>
		</label>
	);
}

function getDropFileClassName(
	size: NonNullable<ClickOrDragDropFileProps["size"]>,
	stackable: boolean,
) {
	const base =
		"cursor-pointer rounded-md border border-dashed border-skyblue/35 bg-skyblue/8 font-semibold text-skyblue transition hover:bg-skyblue/12";
	const direction = stackable
		? "inline-flex flex-col items-center justify-center text-center"
		: "inline-flex items-center justify-center";

	if (size === "large") {
		return `${base} ${direction} min-h-32 gap-3 px-5 py-5 text-sm`;
	}

	if (size === "medium") {
		return `${base} ${direction} min-h-20 gap-2.5 px-4 py-3 text-sm`;
	}

	return `${base} ${direction} h-11 gap-2 px-4 text-sm`;
}

function getIconClassName(
	size: NonNullable<ClickOrDragDropFileProps["size"]>,
	isBusy = false,
) {
	const animation = isBusy ? " animate-spin" : "";

	if (size === "large") {
		return `h-7 w-7${animation}`;
	}

	if (size === "medium") {
		return `h-5 w-5${animation}`;
	}

	return `h-4 w-4${animation}`;
}

function getAcceptedLabelClassName(
	size: NonNullable<ClickOrDragDropFileProps["size"]>,
) {
	return size === "short"
		? "sr-only"
		: "text-xs font-medium text-darknavy/45";
}
