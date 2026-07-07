type MaintenanceStatusBadgeProps = {
	className?: string;
	status: string;
};

export function MaintenanceStatusBadge({
	className = "",
	status,
}: MaintenanceStatusBadgeProps) {
	const statusClassName =
		status === "Active"
			? "bg-citron/25 text-darknavy"
			: "bg-darknavy/8 text-darknavy/55";

	return (
		<span
			className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName} ${className}`.trim()}
		>
			{status}
		</span>
	);
}
