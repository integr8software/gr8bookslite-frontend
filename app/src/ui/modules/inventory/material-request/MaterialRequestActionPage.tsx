"use client";

import Link from "next/link";
import {
	ArrowLeft,
	ArrowRight,
	ClipboardList,
	Copy,
	Download,
	Edit3,
	Eye,
	FileDown,
	Plus,
	Save,
	Search,
	Upload,
	X,
} from "lucide-react";
import {
	MaterialRequestActionPageCopy,
	MaterialRequestHref,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { MaterialRequestDetailsPanel } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDetailsPanel";
import { MaterialRequestItemsTable } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestItemsTable";
import { MaterialRequestNotFound } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestNotFound";
import { MaterialRequestStatusBadge } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestStatusBadge";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MaterialRequestActionPage() {
	const page = useMaterialRequestFormPage();
	const copy = MaterialRequestActionPageCopy[page.mode];

	if (page.needsRecord && !page.existingRequest) {
		return <MaterialRequestNotFound />;
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					page.mode === "add"
						? copy.title
						: `${copy.title} ${page.existingRequest?.requestNo ?? ""}`
				}
				description={copy.description}
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory request
					</>
				}
				actions={<MaterialRequestHeaderActions page={page} />}
			/>

			<MaterialRequestCommandBar page={page} />

			{page.mode === "view" ? (
				<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<ReadOnlyStat label="MR No." value={page.values.requestNo} />
						<ReadOnlyStat label="Warehouse" value={page.values.fromWarehouse} />
						<ReadOnlyStat label="Requestor" value={page.values.requestedBy} />
						<ReadOnlyStat label="Project" value={page.values.projectName || "-"} />
						<div>
							<p className="text-xs font-semibold uppercase text-darknavy/55">
								Status
							</p>
							<div className="mt-2">
								<MaterialRequestStatusBadge status={page.values.status} />
							</div>
						</div>
					</div>
				</div>
			) : null}

			<MaterialRequestDetailsPanel
				errors={page.errors}
				isReadonly={page.isReadonly}
				updateField={page.updateField}
				values={page.values}
			/>

			<MaterialRequestItemsTable
				error={page.errors.items}
				isReadonly={page.isReadonly}
				items={page.values.items}
				onAddItem={page.addItem}
				onRemoveItem={page.removeItem}
				onUpdateItem={page.updateItem}
			/>
		</section>
	);
}

type MaterialRequestActionPageState = ReturnType<typeof useMaterialRequestFormPage>;

function MaterialRequestHeaderActions({
	page,
}: {
	page: MaterialRequestActionPageState;
}) {
	return (
		<>
			<Link
				href={MaterialRequestHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				List
			</Link>
			{page.mode === "view" ? (
				<Link
					href={`${MaterialRequestHref}/edit/${page.existingRequest?.id ?? ""}`}
					className={moduleHeaderActionClassNames.primary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : (
				<button
					type="button"
					onClick={page.handleSubmit}
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save
				</button>
			)}
		</>
	);
}

function MaterialRequestCommandBar({
	page,
}: {
	page: MaterialRequestActionPageState;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 xl:flex-row xl:items-center xl:justify-between">
			<div className="flex flex-wrap gap-2">
				<ActionLink href={MaterialRequestHref} icon={Search} label="Search" />
				<ActionLink href={`${MaterialRequestHref}/add`} icon={Plus} label="New" />
				<ActionLink
					href={
						page.existingRequest
							? `${MaterialRequestHref}/edit/${page.existingRequest.id}`
							: `${MaterialRequestHref}/add`
					}
					icon={Edit3}
					label="Edit"
					isDisabled={!page.existingRequest || page.mode === "edit"}
				/>
				<ActionButton
					icon={Save}
					label="Save"
					isDisabled={page.isReadonly}
					onClick={page.handleSubmit}
				/>
				<ActionLink href={MaterialRequestHref} icon={X} label="Close" />
				<ActionButton icon={Copy} label="Copy From" isDisabled />
				<ActionLink
					href={
						page.previousRequest
							? `${MaterialRequestHref}/view/${page.previousRequest.id}`
							: "#"
					}
					icon={ArrowLeft}
					label="Prev"
					isDisabled={!page.previousRequest}
				/>
				<ActionLink
					href={
						page.nextRequest
							? `${MaterialRequestHref}/view/${page.nextRequest.id}`
							: "#"
					}
					icon={ArrowRight}
					label="Next"
					isDisabled={!page.nextRequest}
				/>
				<ActionLink
					href={
						page.existingRequest
							? `${MaterialRequestHref}/view/${page.existingRequest.id}`
							: "#"
					}
					icon={Eye}
					label="Preview"
					isDisabled={!page.existingRequest}
				/>
			</div>
			<div className="flex flex-wrap gap-2">
				<ActionButton icon={Upload} label="Upload" variant="success" isDisabled />
				<ActionButton icon={Download} label="Download" variant="success" />
				<ActionLink href={MaterialRequestHref} icon={FileDown} label="Cancel" variant="danger" />
			</div>
		</div>
	);
}

type ActionControlProps = {
	icon: typeof Search;
	isDisabled?: boolean;
	label: string;
	variant?: "default" | "danger" | "success";
};

function ActionLink({
	href,
	icon: Icon,
	isDisabled = false,
	label,
	variant = "default",
}: ActionControlProps & { href: string }) {
	if (isDisabled) {
		return (
			<span className={actionClassName(variant, true)}>
				<Icon className="h-4 w-4" aria-hidden="true" />
				{label}
			</span>
		);
	}

	return (
		<Link href={href} className={actionClassName(variant)}>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</Link>
	);
}

function ActionButton({
	icon: Icon,
	isDisabled = false,
	label,
	onClick,
	variant = "default",
}: ActionControlProps & { onClick?: () => void }) {
	return (
		<button
			type="button"
			disabled={isDisabled}
			onClick={onClick}
			className={actionClassName(variant, isDisabled)}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

function actionClassName(
	variant: "default" | "danger" | "success",
	isDisabled = false,
) {
	return joinClasses(
		"inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4",
		variant === "default" &&
			"bg-skyblue text-white hover:bg-skyblue/90 focus-visible:ring-skyblue/20",
		variant === "success" &&
			"bg-citron text-darknavy hover:bg-citron/85 focus-visible:ring-citron/30",
		variant === "danger" &&
			"bg-coralpink text-white hover:bg-coralpink/90 focus-visible:ring-coralpink/25",
		isDisabled && "pointer-events-none cursor-not-allowed opacity-45",
	);
}

function ReadOnlyStat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase text-darknavy/55">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold text-darknavy">{value}</p>
		</div>
	);
}
