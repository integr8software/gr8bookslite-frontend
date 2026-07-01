"use client";

import { useState } from "react";
import { Eye, EyeOff, SlidersHorizontal, X } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleVisibilityField = {
	id: string;
	isVisible: boolean;
	label: string;
	onVisibleChange: (isVisible: boolean) => void;
};

type ModuleFieldsVisibilityDialogProps = {
	buttonLabel: string;
	className?: string;
	fields: ModuleVisibilityField[];
	title: string;
};

export function ModuleFieldsVisibilityDialog({
	buttonLabel,
	className,
	fields,
	title,
}: ModuleFieldsVisibilityDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const titleId = `${toKebabCase(title)}-dialog-title`;

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={joinClasses(
					"inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:border-skyblue/35 hover:bg-skyblue/10 focus:outline-none focus:ring-4 focus:ring-skyblue/10",
					className,
				)}
			>
				<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
				{buttonLabel}
			</button>

			{isOpen ? (
				<div
					role="presentation"
					className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							setIsOpen(false);
						}
					}}
				>
					<section
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						className="flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-md border border-darknavy/10 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
					>
						<div className="relative border-b border-darknavy/10 px-5 py-3 text-center">
							<h2 id={titleId} className="text-sm font-semibold text-darknavy/75">
								{title}
							</h2>
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-skyblue/10 hover:text-darknavy"
								aria-label={`Close ${title.toLowerCase()} dialog`}
							>
								<X className="h-4 w-4" aria-hidden="true" />
							</button>
						</div>

						<div className="grid max-h-[min(34rem,calc(100dvh-8rem))] gap-3 overflow-y-auto p-4 sm:grid-cols-2">
							{fields.map((field) => {
								const ToggleIcon = field.isVisible ? Eye : EyeOff;

								return (
									<div
										key={field.id}
										className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 bg-white p-3"
									>
										<span className="min-w-0 text-sm font-semibold text-darknavy/70">
											{field.label}
										</span>
										<button
											type="button"
											onClick={() => field.onVisibleChange(!field.isVisible)}
											className={joinClasses(
												"inline-flex h-8 min-w-20 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold transition",
												field.isVisible
													? "border-skyblue/35 bg-skyblue/10 text-darknavy hover:bg-skyblue/15"
													: "border-darknavy/10 bg-offwhite text-darknavy/55 hover:bg-darknavy/5",
											)}
										>
											<ToggleIcon className="h-3.5 w-3.5" aria-hidden="true" />
											{field.isVisible ? "Hide" : "Show"}
										</button>
									</div>
								);
							})}
						</div>
					</section>
				</div>
			) : null}
		</>
	);
}

function toKebabCase(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}
