export function ModuleSystemPageSkeleton() {
	return (
		<section className="grid gap-5">
			<div className="h-36 animate-pulse rounded-lg border border-darknavy/10 bg-darknavy/4" />
			<div className="grid gap-5 xl:grid-cols-2">
				<div className="h-80 animate-pulse rounded-lg border border-darknavy/10 bg-darknavy/4" />
				<div className="h-80 animate-pulse rounded-lg border border-darknavy/10 bg-darknavy/4" />
			</div>
		</section>
	);
}
