import type { Metadata } from "next";
import { LoginForm } from "@/app/src/ui/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | GR8BooksLite",
};

export default function LoginPage() {
  return <LoginForm />;
}
