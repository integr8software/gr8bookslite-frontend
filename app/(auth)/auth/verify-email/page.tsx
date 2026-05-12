import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";

const OtpForm = dynamic(
	() =>
		import("@/app/src/ui/auth/OtpForm").then((module) => module.OtpForm),
	{
		ssr: false,
	},
);

export const metadata: Metadata = {
	title: "Verify email | GR8BooksLite",
};

export default function VerifyEmailPage() {
	return (
		<div className="relative isolate min-h-screen">
			<GradientBlurBackground />
			<OtpForm />
		</div>
	);
}
