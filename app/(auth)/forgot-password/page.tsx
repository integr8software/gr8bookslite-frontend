import type { Metadata } from "next";
import { AuthShell } from "@/app/src/ui/auth/AuthShell";
import { ForgotPasswordForm } from "@/app/src/ui/auth/ForgotPasswordForm";

export const metadata: Metadata = {
	title: "Forgot password | GR8BooksLite",
};

export default function ForgotPasswordPage() {
	return (
		<AuthShell
			title="Reset password"
			subtitle="Enter your email to validate a password reset request."
			footer={{
				label: "Remember your password?",
				href: "/login",
				action: "Log in",
			}}
		>
			<ForgotPasswordForm />
		</AuthShell>
	);
}
