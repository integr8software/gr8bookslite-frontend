type LandingDocumentHeaderProps = Readonly<{
	title: string;
	lastUpdated: string;
	tone?: "blue" | "indigo";
}>;

export function LandingDocumentHeader({
	title,
	lastUpdated,
	tone = "blue",
}: LandingDocumentHeaderProps) {
	const backgroundClassName =
		tone === "indigo"
			? "bg-gradient-to-r from-indigo-950 via-slate-900 to-black"
			: "bg-gradient-to-r from-slate-950 via-slate-900 to-black";
	const topGlowClassName =
		tone === "indigo" ? "bg-indigo-500/20" : "bg-blue-500/20";
	const topRadialClassName =
		tone === "indigo"
			? "bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_55%)]"
			: "bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_55%)]";
	const bottomRadialClassName =
		tone === "indigo"
			? "bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.15),transparent_60%)]"
			: "bg-[radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.18),transparent_60%)]";

	return (
		<header className="relative w-full overflow-hidden border-b border-white/10">
			<div className={`absolute inset-0 ${backgroundClassName}`} />
			<div className={`absolute inset-0 ${topRadialClassName}`} />
			<div className={`absolute inset-0 ${bottomRadialClassName}`} />

			<div
				className={`absolute -top-20 -left-20 h-72 w-72 rounded-full blur-3xl ${topGlowClassName}`}
			/>
			<div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

			<div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-16 sm:flex-row sm:px-8 lg:px-10">
				<h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:w-1/2 md:w-3/4 lg:w-1/2 md:text-6xl lg:text-7xl">
					<span className="bg-linear-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-left text-transparent">
						{title}
					</span>
				</h1>

				<p className="text-sm text-white/70 sm:mt-5 sm:text-right md:text-base">
					Last Updated:{" "}
					<span className="text-white">{lastUpdated}</span>
				</p>
			</div>
		</header>
	);
}
