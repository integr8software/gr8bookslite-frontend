import Image from "next/image";

export function AuthGoogleButton({
	href,
	label,
}: Readonly<{ href: string; label: string }>) {
	return (
		<a
			href={href}
			className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/60 hover:bg-offwhite focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
		>
			<Image
				src="/img/google-icon.png"
				alt=""
				width={18}
				height={18}
			/>
			<span>{label}</span>
		</a>
	);
}
