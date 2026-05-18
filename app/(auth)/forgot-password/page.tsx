import type { Metadata } from "next";
import { GradientBlurBackground } from "@/app/src/ui/shared/GradientBlurBackground";
import { ForgotPasswordForm } from "@/app/src/ui/auth/ForgotPasswordForm";

export const metadata: Metadata = {
	title: "Forgot password | GR8BooksLite",
};

export default function ForgotPasswordPage() {
	return (
		<div className="relative isolate min-h-screen">
			<GradientBlurBackground />
			<ForgotPasswordForm />
		</div>
	);
}
