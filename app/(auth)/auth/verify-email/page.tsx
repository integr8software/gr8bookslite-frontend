import type { Metadata } from "next";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";
import { OtpForm } from "@/app/src/ui/auth/OtpForm";

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
