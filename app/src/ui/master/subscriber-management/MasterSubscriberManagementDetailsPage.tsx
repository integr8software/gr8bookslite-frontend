"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
	ArrowRight,
	Building2,
	Edit3,
	type LucideIcon,
	Mail,
	Phone,
	ShieldCheck,
	Users,
} from "lucide-react";
import {
	MasterSubscriberAccountTabs,
	getMasterSubscriberManagementEditHref,
	getMasterSubscriberManagementSectionHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import {
	getMasterSubscriberManagementSubscriber,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type { MasterSubscriberManagementListRecord } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { MasterSubscriberManagementMoreActions } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementActions";
import {
	MasterSubscriberStatusBadge,
} from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementBadges";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function MasterSubscriberManagementDetailsPage({
	recordId,
}: {
	recordId: string;
}) {
	const subscriber = getMasterSubscriberManagementSubscriber(recordId);

	return (
		<section className="grid gap-5">
			<SubscriberProfileHeader subscriber={subscriber} />
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
				<AccountTabBar recordId={subscriber.id} />
				<div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_24rem] xl:p-5">
					<div className="grid gap-5">
						<SubscriberProfileCard subscriber={subscriber} />
						<AuditInformationCard subscriber={subscriber} />
					</div>
					<AccountSummaryPanel subscriber={subscriber} />
				</div>
			</div>
		</section>
	);
}

function SubscriberProfileHeader({
	subscriber,
}: {
	subscriber: MasterSubscriberManagementListRecord;
}) {
	return (
		<header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
				<div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[var(--skyblue)] text-2xl font-bold text-white shadow-[0_18px_50px_rgb(var(--skyblue-rgb)/0.25)]">
					{subscriber.initials}
				</div>
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<h1 className="text-3xl font-semibold leading-tight text-darknavy">
							{subscriber.name}
						</h1>
						<MasterSubscriberStatusBadge
							status={subscriber.status}
						/>
					</div>
					<div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-darknavy/65">
						<span className="inline-flex items-center gap-2">
							<Mail className="h-4 w-4" aria-hidden="true" />
							{subscriber.email}
						</span>
						<span className="inline-flex items-center gap-2">
							<Phone className="h-4 w-4" aria-hidden="true" />
							{subscriber.contactNumber}
						</span>
					</div>
					<div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-darknavy/70">
						<span>Subscriber ID: {subscriber.subscriberId}</span>
						<span>Registered on: {subscriber.dateRegisteredLabel}</span>
					</div>
				</div>
			</div>
			<MasterSubscriberManagementMoreActions recordId={subscriber.id} />
		</header>
	);
}

function AccountTabBar({ recordId }: { recordId: string }) {
	return (
		<nav className="flex overflow-x-auto border-b border-darknavy/10 px-4 pt-3 xl:px-5">
			{MasterSubscriberAccountTabs.map((tab) => {
				const Icon = tab.icon;
				const href =
					tab.key === "account-information"
						? `/master/subscriber-management/view/${recordId}`
						: tab.key === "company-information"
							? getMasterSubscriberManagementSectionHref(
									recordId,
									"company-information",
								)
							: getMasterSubscriberManagementSectionHref(
									recordId,
									"users",
								);
				const isActive = tab.key === "account-information";

				return (
					<Link
						key={tab.key}
						href={href}
						className={joinClasses(
							"relative inline-flex h-14 min-w-max items-center gap-2 px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
							isActive
								? "text-[var(--skyblue)]"
								: "text-darknavy/68 hover:text-darknavy",
						)}
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
						{tab.label}
						{isActive ? (
							<span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--skyblue)]" />
						) : null}
					</Link>
				);
			})}
		</nav>
	);
}

function SubscriberProfileCard({
	subscriber,
}: {
	subscriber: MasterSubscriberManagementListRecord;
}) {
	return (
		<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="mb-5 flex flex-col gap-3 border-b border-darknavy/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
				<CardTitle icon={Users} title="Subscriber Profile" />
				<Link
					href={`${getMasterSubscriberManagementEditHref(subscriber.id)}?from=view`}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-[var(--skyblue)] shadow-sm shadow-darknavy/5 transition hover:bg-skyblue/10"
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit Profile
				</Link>
			</div>
			<div className="grid gap-4">
				<InfoRow label="Subscriber ID" value={subscriber.subscriberId} />
				<InfoRow label="Subscriber Name" value={subscriber.name} />
				<InfoRow label="Email Address" value={subscriber.email} />
				<InfoRow label="Phone Number" value={subscriber.contactNumber} />
				<InfoRow
					label="Status"
					value={<MasterSubscriberStatusBadge status={subscriber.status} />}
				/>
				<InfoRow label="Date Registered" value={subscriber.registeredAt} />
				<InfoRow
					label="Last Login"
					value={`${subscriber.lastLoginDate} ${subscriber.lastLoginTime}`}
				/>
			</div>
		</article>
	);
}

function AuditInformationCard({
	subscriber,
}: {
	subscriber: MasterSubscriberManagementListRecord;
}) {
	return (
		<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<CardTitle icon={ShieldCheck} title="Audit Information" />
			<div className="mt-5 grid gap-5 md:grid-cols-2">
				<div className="grid gap-4">
					<InfoRow compact label="Created By" value="Super Admin" />
					<InfoRow
						compact
						label="Created Date"
						value={subscriber.registeredAt}
					/>
				</div>
				<div className="grid gap-4 border-darknavy/10 md:border-l md:pl-6">
					<InfoRow compact label="Updated By" value={subscriber.updatedBy} />
					<InfoRow compact label="Updated Date" value={subscriber.updatedAt} />
				</div>
			</div>
		</article>
	);
}

function AccountSummaryPanel({
	subscriber,
}: {
	subscriber: MasterSubscriberManagementListRecord;
}) {
	const cards = [
		{
			href: getMasterSubscriberManagementSectionHref(
				subscriber.id,
				"company-information",
			),
			icon: Building2,
			label: "Total Companies",
			tone: "bg-skyblue/14 text-blue-700",
			value: subscriber.companies,
		},
		{
			href: getMasterSubscriberManagementSectionHref(
				subscriber.id,
				"branches",
			),
			icon: Building2,
			label: "Total Branches",
			tone: "bg-emerald-500/14 text-emerald-700",
			value: subscriber.branches,
		},
		{
			href: getMasterSubscriberManagementSectionHref(subscriber.id, "users"),
			icon: Users,
			label: "Total Users",
			tone: "bg-purple-500/14 text-purple-700",
			value: subscriber.users,
		},
	];

	return (
		<aside className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<CardTitle icon={Building2} title="Account Summary" />
			<div className="mt-5 grid gap-4">
				{cards.map((card) => {
					const Icon = card.icon;

					return (
						<Link
							key={card.label}
							href={card.href}
							className="group rounded-lg border border-darknavy/10 bg-offwhite/70 p-5 transition hover:border-[rgb(var(--skyblue-rgb)/0.35)] hover:bg-skyblue/10"
						>
							<div className="flex items-center gap-4">
								<span
									className={joinClasses(
										"flex h-16 w-16 items-center justify-center rounded-full",
										card.tone,
									)}
								>
									<Icon className="h-8 w-8" aria-hidden="true" />
								</span>
								<span>
									<span className="block text-sm font-semibold text-darknavy/70">
										{card.label}
									</span>
									<span className="mt-2 block text-4xl font-bold leading-none text-darknavy">
										{card.value}
									</span>
								</span>
							</div>
							<span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[var(--skyblue)]">
								View all {card.label.replace("Total ", "").toLowerCase()}
								<ArrowRight
									className="h-4 w-4 transition group-hover:translate-x-0.5"
									aria-hidden="true"
								/>
							</span>
						</Link>
					);
				})}
			</div>
		</aside>
	);
}

function CardTitle({
	icon: Icon,
	title,
}: {
	icon: LucideIcon;
	title: string;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-skyblue/12 text-[var(--skyblue)]">
				<Icon className="h-4 w-4" aria-hidden="true" />
			</span>
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
		</div>
	);
}

function InfoRow({
	compact = false,
	label,
	value,
}: {
	compact?: boolean;
	label: string;
	value: ReactNode;
}) {
	return (
		<div
			className={joinClasses(
				"grid gap-2 border-b border-darknavy/10 pb-4 last:border-b-0 last:pb-0",
				compact ? "sm:grid-cols-[9rem_1fr]" : "sm:grid-cols-[12rem_1fr]",
			)}
		>
			<span className="text-sm font-semibold text-darknavy/62">{label}</span>
			<span className="text-sm font-bold text-darknavy">{value}</span>
		</div>
	);
}
