import type { Metadata } from "next";
import { AuthShell } from "@/app/src/ui/auth/AuthShell";
import { LoginForm } from "@/app/src/ui/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | GR8BooksLite",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in"
      subtitle="Access your GR8BooksLite workspace."
      footer={{
        label: "Need an account?",
        href: "/signup",
        action: "Create one",
      }}
    >
      <LoginForm />
    </AuthShell>
  );
}
