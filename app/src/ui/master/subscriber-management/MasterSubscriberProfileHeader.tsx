"use client";

import { Mail, Phone } from "lucide-react";
import type { MasterSubscriberManagementListRecord } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { MasterSubscriberManagementMoreActions } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementActions";
import { MasterSubscriberStatusBadge } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementBadges";

type MasterSubscriberProfileHeaderProps = {
	subscriber: MasterSubscriberManagementListRecord;
};

export function MasterSubscriberProfileHeader({
	subscriber,
}: MasterSubscriberProfileHeaderProps) {
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
						<MasterSubscriberStatusBadge status={subscriber.status} />
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
