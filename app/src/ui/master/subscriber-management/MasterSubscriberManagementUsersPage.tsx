"use client";

import { useMemo, useState } from "react";
import { Mail, Search, Users } from "lucide-react";
import {
	createMasterSubscriberManagementCompanyUsers,
	getMasterSubscriberManagementCompaniesForSubscriber,
	getMasterSubscriberManagementSubscriber,
} from "@/app/src/data/master/subscriber-management/MasterSubscriberManagementData";
import type {
	MasterSubscriberManagementUserRecord,
	MasterSubscriberManagementUserStatus,
} from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import { MasterUserStatusBadge } from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementBadges";
import { MasterSubscriberAccountTabBar } from "@/app/src/ui/master/subscriber-management/MasterSubscriberAccountTabBar";
import { MasterSubscriberProfileHeader } from "@/app/src/ui/master/subscriber-management/MasterSubscriberProfileHeader";
import { ModuleTableFilterSelect } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type SubscriberUserRow = MasterSubscriberManagementUserRecord & {
	companyName: string;
};

export function MasterSubscriberManagementUsersPage({
	recordId,
}: {
	recordId: string;
}) {
	const subscriber = getMasterSubscriberManagementSubscriber(recordId);
	const companies = getMasterSubscriberManagementCompaniesForSubscriber(recordId);
	const users = useMemo(
		() =>
			companies.flatMap((company) =>
				createMasterSubscriberManagementCompanyUsers(company).map((user) => ({
					...user,
					companyName: company.name,
				})),
			),
		[companies],
	);
	const [query, setQuery] = useState("");
	const [companyFilter, setCompanyFilter] = useState("All");
	const [statusFilter, setStatusFilter] = useState<
		MasterSubscriberManagementUserStatus | "All"
	>("All");
	const filteredUsers = users.filter((user) => {
		const matchesQuery = [user.name, user.email, user.phone, user.companyName]
			.join(" ")
			.toLowerCase()
			.includes(query.trim().toLowerCase());

		return (
			matchesQuery &&
			(companyFilter === "All" || user.companyName === companyFilter) &&
			(statusFilter === "All" || user.status === statusFilter)
		);
	});
	const activeUsers = users.filter((user) => user.status === "Active").length;
	const inactiveUsers = users.filter((user) => user.status === "Inactive").length;
	const invitedUsers = users.filter((user) => user.status === "Invited").length;

	return (
		<section className="grid min-w-0 gap-5">
			<MasterSubscriberProfileHeader subscriber={subscriber} />
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
				<MasterSubscriberAccountTabBar activeTab="users" recordId={subscriber.id} />
				<div className="grid gap-4 p-4 xl:p-5">
					<div>
						<h2 className="text-xl font-semibold text-darknavy">All Subscriber Users</h2>
						<p className="mt-1 text-sm font-semibold text-darknavy/60">
							Users across all {companies.length} subscriber companies.
						</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<UserMetric icon={Users} label="Total Users" value={subscriber.users} />
						<UserMetric icon={Users} label="Active Users" value={activeUsers} />
						<UserMetric icon={Users} label="Inactive Users" value={inactiveUsers} />
						<UserMetric icon={Mail} label="Invited Users" value={invitedUsers} />
					</div>
					<div className="grid gap-3 rounded-lg border border-darknavy/10 bg-offwhite/40 p-3 md:grid-cols-[minmax(16rem,1fr)_minmax(12rem,0.7fr)_minmax(10rem,0.5fr)]">
						<label className="relative">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/45" aria-hidden="true" />
							<input
								className="h-11 w-full rounded-lg border border-darknavy/10 bg-white pl-10 pr-3 text-sm font-semibold text-darknavy outline-none focus:border-[var(--skyblue)]"
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search users or companies..."
								value={query}
							/>
						</label>
						<ModuleTableFilterSelect
							label="Company"
							onChange={setCompanyFilter}
							options={[
								{ label: "All Companies", value: "All" },
								...companies.map((company) => ({
									label: company.name,
									value: company.name,
								})),
							]}
							value={companyFilter}
						/>
						<ModuleTableFilterSelect
							label="Status"
							onChange={(value) =>
								setStatusFilter(
									value as MasterSubscriberManagementUserStatus | "All",
								)
							}
							options={[
								{ label: "All Statuses", value: "All" },
								{ label: "Active", value: "Active" },
								{ label: "Inactive", value: "Inactive" },
								{ label: "Invited", value: "Invited" },
							]}
							value={statusFilter}
						/>
					</div>
					<div className="grid gap-3 lg:hidden">
						{filteredUsers.map((user) => <UserCard key={user.id} user={user} />)}
					</div>
					<div className="hidden overflow-x-auto rounded-lg border border-darknavy/10 lg:block">
						<table className="w-full min-w-[60rem] text-left text-sm">
							<thead className="bg-offwhite text-xs font-bold text-darknavy/65">
								<tr>{["User", "Company", "Branch Access", "Status", "Last Active", "Added On"].map((label) => <th className="px-4 py-3" key={label}>{label}</th>)}</tr>
							</thead>
							<tbody className="divide-y divide-darknavy/10">
								{filteredUsers.map((user) => (
									<tr key={user.id}>
										<td className="px-4 py-3"><p className="font-bold text-darknavy">{user.name}</p><p className="mt-1 text-xs font-semibold text-darknavy/50">{user.email}</p></td>
										<td className="px-4 py-3 font-semibold text-darknavy/70">{user.companyName}</td>
										<td className="px-4 py-3 font-semibold text-darknavy/70">{user.branchAccess.join(", ")}</td>
										<td className="px-4 py-3"><MasterUserStatusBadge status={user.status} /></td>
										<td className="px-4 py-3 font-semibold text-darknavy/70">{user.lastActiveDate} {user.lastActiveTime}</td>
										<td className="px-4 py-3 font-semibold text-darknavy/70">{user.addedOn}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="text-sm font-semibold text-darknavy/60">
						Showing {filteredUsers.length} of {users.length} users
					</p>
				</div>
			</div>
		</section>
	);
}

function UserMetric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
	return <div className="flex items-center gap-3 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/15 text-[var(--skyblue)]"><Icon className="h-5 w-5" aria-hidden="true" /></span><span><span className="block text-xs font-semibold text-darknavy/55">{label}</span><span className="mt-1 block text-2xl font-bold text-darknavy">{value}</span></span></div>;
}

function UserCard({ user }: { user: SubscriberUserRow }) {
	return <article className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-darknavy">{user.name}</p><p className="mt-1 break-all text-xs font-semibold text-darknavy/50">{user.email}</p></div><MasterUserStatusBadge status={user.status} /></div><div className="mt-4 grid gap-3 border-t border-darknavy/10 pt-4 sm:grid-cols-2"><UserDetail label="Company" value={user.companyName} /><UserDetail label="Branch Access" value={user.branchAccess.join(", ")} /><UserDetail label="Last Active" value={`${user.lastActiveDate} ${user.lastActiveTime}`} /><UserDetail label="Added On" value={user.addedOn} /></div></article>;
}

function UserDetail({ label, value }: { label: string; value: string }) {
	return <div><p className="text-xs font-semibold text-darknavy/50">{label}</p><p className="mt-1 break-words text-sm font-bold text-darknavy">{value}</p></div>;
}
