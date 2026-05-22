export function TermManagementNotFound() {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-darknavy">Term not found</h2>
			<p className="mt-2 text-sm text-darknavy/65">
				The requested term record does not exist or has already been removed.
			</p>
		</div>
	);
}
