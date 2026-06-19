export function LandingPageIntro({
	eyebrow,
	title,
	description,
}: Readonly<{
	eyebrow: string;
	title: string;
	description: string;
}>) {
	return (
		<section className="landing-section bg-white text-slate-950">
			<div className="landing-section-content max-w-3xl text-center">
				<p className="text-sm font-bold uppercase tracking-[0.08em] text-sky-700">
					{eyebrow}
				</p>
				<h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
					{title}
				</h1>
				<p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
					{description}
				</p>
			</div>
		</section>
	);
}
