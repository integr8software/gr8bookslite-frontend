"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
	ArrowLeft,
	Check,
	CheckSquare,
	Save,
	Shuffle,
	SlidersHorizontal,
	UserRound,
} from "lucide-react";
import {
	MasterSubscriberPromotionAssignmentModeOptions,
	MasterSubscriberPromotionsHref,
} from "@/app/src/constants/master/subscriber-promotions/MasterSubscriberPromotionConstants";
import {
	MasterSubscriberPromotionBillingCycleConditionOptions,
	MasterSubscriberPromotionPlanOptions,
	MasterSubscriberPromotionPromotionOptions,
	MasterSubscriberPromotionStatusConditionOptions,
	MasterSubscriberPromotionSubscriberOptions,
} from "@/app/src/data/master/subscriber-promotions/MasterSubscriberPromotionData";
import { useMasterSubscriberPromotionFormPage } from "@/app/src/hooks/master/subscriber-promotions/useMasterSubscriberPromotionFormPage";
import type {
	MasterSubscriberPromotionAssignmentMode,
	MasterSubscriberPromotionFormErrors,
	MasterSubscriberPromotionFormValues,
} from "@/app/src/types/master/subscriber-promotions/MasterSubscriberPromotionTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/58";

const AssignmentModeIcons: Record<
	MasterSubscriberPromotionAssignmentMode,
	ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
	"Chosen subscriber": UserRound,
	"Condition based": SlidersHorizontal,
	"Multiple selected": CheckSquare,
	"Random pick": Shuffle,
};

export function MasterSubscriberPromotionFormPage() {
	const page = useMasterSubscriberPromotionFormPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscriber Billing"
				title="Give Promotion"
				description="Assign generated or existing promotions to subscribers by a chosen subscriber, conditions, multiple selections, or random selection."
				actions={
					<>
						<Link
							href={MasterSubscriberPromotionsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<button
							type="button"
							onClick={page.assignPromotions}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Assign
						</button>
					</>
				}
			/>
			<div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
				<div className="grid gap-5">
					<FormPanel title="Assignment Mode">
						<AssignmentModeField
							value={page.values.assignmentMode}
							onChange={page.updateAssignmentMode}
						/>
					</FormPanel>
					<FormPanel title="Promotions">
						<PromotionSelectionField
							error={page.errors.promotionIds}
							value={page.values.promotionIds}
							onToggle={page.togglePromotion}
						/>
					</FormPanel>
					<FormPanel title="Subscribers">
						<SubscriberAudienceField
							errors={page.errors}
							values={page.values}
							onToggleConditionValue={page.toggleConditionValue}
							onToggleSubscriber={page.toggleSubscriber}
							onUpdate={page.updateValues}
						/>
					</FormPanel>
				</div>
				<div className="grid content-start gap-5">
					<FormPanel title="Timing">
						<div className="grid gap-4">
							<label className={FieldLabelClassName}>
								Start date
								<input
									type="date"
									value={page.values.startsAt}
									onChange={(event) =>
										page.updateValues({ startsAt: event.target.value })
									}
									className={ControlClassName}
								/>
								<FieldError message={page.errors.startsAt} />
							</label>
							<label className={FieldLabelClassName}>
								Expires
								<input
									type="date"
									value={page.values.expiresAt}
									onChange={(event) =>
										page.updateValues({ expiresAt: event.target.value })
									}
									className={ControlClassName}
								/>
								<FieldError message={page.errors.expiresAt} />
							</label>
							<label className={FieldLabelClassName}>
								Notes
								<textarea
									rows={4}
									value={page.values.notes}
									onChange={(event) =>
										page.updateValues({ notes: event.target.value })
									}
									className="min-h-28 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
								/>
								<FieldError message={page.errors.notes} />
							</label>
						</div>
					</FormPanel>
					<FormPanel title="Preview">
						<div className="grid gap-4">
							<div className="rounded-lg bg-darknavy p-4 text-white">
								<p className="text-sm font-semibold text-white/65">
									Assignment
								</p>
								<p className="mt-2 text-2xl font-semibold">
									{page.summaryLabel}
								</p>
							</div>
							<PreviewList
								title="Promotions"
								items={page.selectedPromotions.map((promotion) => ({
									id: promotion.id,
									label: promotion.name,
									meta: promotion.code,
								}))}
							/>
							<PreviewList
								title="Subscribers"
								items={page.audience.map((subscriber) => ({
									id: subscriber.id,
									label: subscriber.name,
									meta: subscriber.ownerName,
								}))}
							/>
							<button
								type="button"
								onClick={page.assignPromotions}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Assign
							</button>
						</div>
					</FormPanel>
				</div>
			</div>
		</section>
	);
}

function AssignmentModeField({
	value,
	onChange,
}: {
	value: MasterSubscriberPromotionAssignmentMode;
	onChange: (value: MasterSubscriberPromotionAssignmentMode) => void;
}) {
	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{MasterSubscriberPromotionAssignmentModeOptions.map((option) => {
				const Icon = AssignmentModeIcons[option];
				const isSelected = value === option;

				return (
					<button
						key={option}
						type="button"
						aria-pressed={isSelected}
						onClick={() => onChange(option)}
						className={joinClasses(
							"flex min-h-16 items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
							isSelected
								? "border-skyblue bg-skyblue/12 text-darknavy"
								: "border-darknavy/10 bg-white text-darknavy/70 hover:bg-skyblue/10",
						)}
					>
						<span
							className={joinClasses(
								"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
								isSelected
									? "bg-skyblue text-white"
									: "bg-offwhite text-darknavy/55",
							)}
						>
							<Icon className="h-4 w-4" aria-hidden={true} />
						</span>
						<span>{option}</span>
					</button>
				);
			})}
		</div>
	);
}

function PromotionSelectionField({
	error,
	value,
	onToggle,
}: {
	error?: string;
	value: string[];
	onToggle: (promotionId: string) => void;
}) {
	const selectedValues = new Set(value);

	return (
		<div className="grid gap-3">
			<div className="grid gap-3 md:grid-cols-2">
				{MasterSubscriberPromotionPromotionOptions.map((promotion) => {
					const isSelected = selectedValues.has(promotion.id);

					return (
						<SelectableButton
							key={promotion.id}
							isSelected={isSelected}
							meta={`${promotion.type} - ${promotion.status}`}
							title={`${promotion.name} (${promotion.code})`}
							onClick={() => onToggle(promotion.id)}
						/>
					);
				})}
			</div>
			<FieldError message={error} />
		</div>
	);
}

function SubscriberAudienceField({
	errors,
	values,
	onToggleConditionValue,
	onToggleSubscriber,
	onUpdate,
}: {
	errors: MasterSubscriberPromotionFormErrors;
	values: MasterSubscriberPromotionFormValues;
	onToggleConditionValue: <
		TKey extends
			| "conditionBillingCycles"
			| "conditionPlanIds"
			| "conditionStatuses",
	>(
		key: TKey,
		value: MasterSubscriberPromotionFormValues[TKey][number],
	) => void;
	onToggleSubscriber: (subscriberId: string) => void;
	onUpdate: (values: Partial<MasterSubscriberPromotionFormValues>) => void;
}) {
	if (values.assignmentMode === "Condition based") {
		return (
			<div className="grid gap-4">
				<CheckboxGroup
					label="Plans"
					values={values.conditionPlanIds}
					options={MasterSubscriberPromotionPlanOptions.map((plan) => ({
						label: plan.label,
						value: plan.id,
					}))}
					onToggle={(value) =>
						onToggleConditionValue("conditionPlanIds", value)
					}
				/>
				<CheckboxGroup
					label="Statuses"
					values={values.conditionStatuses}
					options={MasterSubscriberPromotionStatusConditionOptions.map(
						(status) => ({
							label: status,
							value: status,
						}),
					)}
					onToggle={(value) =>
						onToggleConditionValue("conditionStatuses", value)
					}
				/>
				<CheckboxGroup
					label="Billing cycles"
					values={values.conditionBillingCycles}
					options={MasterSubscriberPromotionBillingCycleConditionOptions.map(
						(cycle) => ({
							label: cycle,
							value: cycle,
						}),
					)}
					onToggle={(value) =>
						onToggleConditionValue("conditionBillingCycles", value)
					}
				/>
				<FieldError
					message={errors.conditionPlanIds ?? errors.subscriberIds}
				/>
			</div>
		);
	}

	if (values.assignmentMode === "Random pick") {
		return (
			<label className={FieldLabelClassName}>
				Random subscribers
				<input
					type="number"
					min={1}
					value={values.randomCount}
					onChange={(event) =>
						onUpdate({ randomCount: toNumber(event.target.value) })
					}
					className={ControlClassName}
				/>
				<FieldError message={errors.randomCount ?? errors.subscriberIds} />
			</label>
		);
	}

	if (values.assignmentMode === "Chosen subscriber") {
		return (
			<label className={FieldLabelClassName}>
				Subscriber
				<select
					value={values.subscriberIds[0] ?? ""}
					onChange={(event) =>
						onUpdate({ subscriberIds: [event.target.value] })
					}
					className={joinClasses(ControlClassName, "app-select-control")}
				>
					{MasterSubscriberPromotionSubscriberOptions.map((subscriber) => (
						<option key={subscriber.id} value={subscriber.id}>
							{subscriber.label}
						</option>
					))}
				</select>
				<FieldError message={errors.subscriberIds} />
			</label>
		);
	}

	const selectedValues = new Set(values.subscriberIds);

	return (
		<div className="grid gap-3">
			<div className="grid gap-3 md:grid-cols-2">
				{MasterSubscriberPromotionSubscriberOptions.map((subscriber) => (
					<SelectableButton
						key={subscriber.id}
						isSelected={selectedValues.has(subscriber.id)}
						meta={`${subscriber.planName} - ${subscriber.status}`}
						title={subscriber.name}
						onClick={() => onToggleSubscriber(subscriber.id)}
					/>
				))}
			</div>
			<FieldError message={errors.subscriberIds} />
		</div>
	);
}

function CheckboxGroup<TValue extends string>({
	label,
	options,
	values,
	onToggle,
}: {
	label: string;
	options: { label: string; value: TValue }[];
	values: TValue[];
	onToggle: (value: TValue) => void;
}) {
	const selectedValues = new Set(values);

	return (
		<div className="grid gap-2">
			<p className="text-sm font-semibold text-darknavy/58">{label}</p>
			<div className="flex flex-wrap gap-2">
				{options.map((option) => {
					const isSelected = selectedValues.has(option.value);

					return (
						<button
							key={option.value}
							type="button"
							aria-pressed={isSelected}
							onClick={() => onToggle(option.value)}
							className={joinClasses(
								"inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
								isSelected
									? "border-skyblue bg-skyblue/12 text-darknavy"
									: "border-darknavy/10 bg-white text-darknavy/65 hover:bg-skyblue/10",
							)}
						>
							<span
								className={joinClasses(
									"flex h-4 w-4 items-center justify-center rounded border",
									isSelected
										? "border-skyblue bg-skyblue text-white"
										: "border-darknavy/18 text-transparent",
								)}
							>
								<Check className="h-3 w-3" aria-hidden="true" />
							</span>
							{option.label}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function SelectableButton({
	isSelected,
	meta,
	title,
	onClick,
}: {
	isSelected: boolean;
	meta: string;
	title: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={isSelected}
			onClick={onClick}
			className={joinClasses(
				"flex min-h-20 w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
				isSelected
					? "border-skyblue bg-skyblue/12 text-darknavy"
					: "border-darknavy/10 bg-white text-darknavy hover:bg-skyblue/10",
			)}
		>
			<span
				className={joinClasses(
					"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
					isSelected
						? "border-skyblue bg-skyblue text-white"
						: "border-darknavy/18 bg-white text-transparent",
				)}
			>
				<Check className="h-3.5 w-3.5" aria-hidden="true" />
			</span>
			<span className="grid min-w-0 gap-1">
				<span className="line-clamp-2 text-sm font-semibold">{title}</span>
				<span className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
					{meta}
				</span>
			</span>
		</button>
	);
}

function PreviewList({
	items,
	title,
}: {
	items: { id: string; label: string; meta: string }[];
	title: string;
}) {
	return (
		<div className="grid gap-2">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-semibold text-darknavy">{title}</p>
				<span className="rounded-md bg-offwhite px-2 py-1 text-xs font-semibold text-darknavy/55">
					{items.length}
				</span>
			</div>
			<div className="grid max-h-52 gap-2 overflow-y-auto rounded-lg border border-darknavy/10 bg-offwhite/35 p-2">
				{items.length > 0 ? (
					items.map((item) => (
						<div
							key={item.id}
							className="rounded-md bg-white px-3 py-2 shadow-sm"
						>
							<p className="truncate text-sm font-semibold text-darknavy">
								{item.label}
							</p>
							<p className="mt-1 truncate text-xs font-medium text-darknavy/48">
								{item.meta}
							</p>
						</div>
					))
				) : (
					<p className="px-3 py-6 text-center text-sm font-medium text-darknavy/45">
						No records selected.
					</p>
				)}
			</div>
		</div>
	);
}

function FormPanel({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}

function toNumber(value: string) {
	const parsedValue = Number(value);

	return Number.isFinite(parsedValue) ? parsedValue : 0;
}
