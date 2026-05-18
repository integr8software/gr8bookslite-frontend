import type { Metadata } from "next";
import { OtpFormClientOnly } from "@/app/src/ui/auth/OtpFormClientOnly";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";

export const metadata: Metadata = {
	title: "Verify email | GR8BooksLite",
};

export default function VerifyEmailPage() {
	return (
		<div className="relative isolate min-h-screen">
			<GradientBlurBackground />
			<OtpFormClientOnly />
		</div>
	);
}
