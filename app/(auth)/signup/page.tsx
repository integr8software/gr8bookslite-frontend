import type { Metadata } from "next";
import { AuthShell } from "@/app/src/ui/auth/AuthShell";
import { SignUpForm } from "@/app/src/ui/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up | GR8BooksLite",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle="Start with a validated account request."
      footer={{
        label: "Already have an account?",
        href: "/login",
        action: "Log in",
      }}
    >
      <SignUpForm />
    </AuthShell>
  );
}
