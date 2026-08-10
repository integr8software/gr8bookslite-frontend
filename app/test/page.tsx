"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
	Check,
	HelpCircle,
	Info,
	Power,
	PowerOff,
	Save,
	TriangleAlert,
	X,
} from "lucide-react";
import type {
	AppDialogIconTone,
	AppDialogTone,
} from "@/app/src/types/shared/app/AppDialogTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";

type DialogDemo = {
	cancelLabel?: string;
	confirmIcon?: ReactNode;
	confirmLabel: string;
	description: string;
	iconTone?: AppDialogIconTone;
	id: string;
	pendingLabel: string;
	title: string;
	tone: AppDialogTone;
};

const DialogDemos: DialogDemo[] = [
	{
		id: "success",
		title: "Save changes?",
		description: "Your latest updates will be applied to this record.",
		confirmLabel: "Save",
		confirmIcon: <Save />,
		pendingLabel: "Saving...",
		tone: "success",
		iconTone: "success",
	},
	{
		id: "error",
		title: "Delete record?",
		description: "This action cannot be undone after confirmation.",
		confirmLabel: "Delete",
		confirmIcon: <X />,
		pendingLabel: "Deleting...",
		tone: "danger",
		iconTone: "error",
	},
	{
		id: "warning",
		title: "Continue anyway?",
		description: "Some details are incomplete and may need review later.",
		confirmLabel: "Continue",
		confirmIcon: <TriangleAlert />,
		pendingLabel: "Continuing...",
		tone: "warning",
		iconTone: "warning",
	},
	{
		id: "info",
		title: "Review information?",
		description: "This dialog can show neutral guidance before an action.",
		confirmLabel: "Got it",
		confirmIcon: <Info />,
		pendingLabel: "Loading...",
		tone: "info",
		iconTone: "info",
	},
	{
		id: "question",
		title: "Confirm selection?",
		description: "Choose confirm when the selected option is correct.",
		confirmLabel: "Confirm",
		confirmIcon: <HelpCircle />,
		pendingLabel: "Confirming...",
		tone: "question",
		iconTone: "question",
	},
	{
		id: "activate",
		title: "Activate discount?",
		description:
			"Bulk Purchase Discount will be available for normal selection again.",
		confirmLabel: "Activate",
		confirmIcon: <Power />,
		pendingLabel: "Activating...",
		tone: "activate",
		iconTone: "activate",
	},
	{
		id: "deactivate",
		title: "Deactivate payment type?",
		description:
			"Intercompany Bank Transfer will be hidden from normal selection.",
		confirmLabel: "Deactivate",
		confirmIcon: <PowerOff />,
		pendingLabel: "Deactivating...",
		tone: "deactivate",
		iconTone: "deactivate",
	},
	{
		id: "no-cancel",
		title: "Process completed",
		description: "The request finished successfully and can now be closed.",
		confirmLabel: "Done",
		confirmIcon: <Check />,
		pendingLabel: "Closing...",
		tone: "success",
		iconTone: "success",
		cancelLabel: "",
	},
];

export default function TestDialogsPage() {
	const [activeDialogId, setActiveDialogId] = useState<string | null>(null);
	const [animateIcon, setAnimateIcon] = useState(true);
	const activeDialog = useMemo(
		() => DialogDemos.find((dialog) => dialog.id === activeDialogId) ?? null,
		[activeDialogId],
	);

	return (
		<main className="min-h-screen bg-offwhite px-6 py-10 text-darknavy">
			<section className="mx-auto grid max-w-5xl gap-6">
				<header className="grid gap-2">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-skyblue">
						AppDialog test
					</p>
					<h1 className="font-heading text-3xl font-semibold">
						Dialog Variants
					</h1>
					<p className="max-w-2xl text-sm leading-6 text-darknavy/65">
						Use this page to check the SweetAlert-style icons, centered
						actions, optional animation, and activate/deactivate dialog states.
					</p>
				</header>

				<div className="flex items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-4 py-3 shadow-sm">
					<input
						id="dialog-animation-toggle"
						type="checkbox"
						checked={animateIcon}
						onChange={(event) => setAnimateIcon(event.target.checked)}
						className="h-4 w-4 accent-skyblue"
					/>
					<label
						htmlFor="dialog-animation-toggle"
						className="text-sm font-semibold text-darknavy"
					>
						Animate icon
					</label>
				</div>

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{DialogDemos.map((dialog) => (
						<button
							key={dialog.id}
							type="button"
							onClick={() => setActiveDialogId(dialog.id)}
							className="flex min-h-28 flex-col items-start justify-between rounded-lg border border-darknavy/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-skyblue/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
						>
							<span className="text-sm font-semibold text-darknavy">
								{dialog.title}
							</span>
							<span className="text-xs font-medium uppercase tracking-[0.14em] text-darknavy/45">
								{dialog.id}
							</span>
						</button>
					))}
				</div>
			</section>

			{activeDialog ? (
				<AppDialog
					animateIcon={animateIcon}
					cancelLabel={activeDialog.cancelLabel || "Cancel"}
					confirmIcon={activeDialog.confirmIcon}
					confirmLabel={activeDialog.confirmLabel}
					description={activeDialog.description}
					iconTone={activeDialog.iconTone}
					isOpen={Boolean(activeDialog)}
					pendingLabel={activeDialog.pendingLabel}
					showCancel={activeDialog.cancelLabel !== ""}
					title={activeDialog.title}
					tone={activeDialog.tone}
					onCancel={() => setActiveDialogId(null)}
					onConfirm={async () => {
						await new Promise((resolve) => {
							window.setTimeout(resolve, 1200);
						});
						setActiveDialogId(null);
					}}
				/>
			) : null}
		</main>
	);
}
