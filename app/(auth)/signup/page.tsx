import type { Metadata } from "next";
import { SignUpForm } from "@/app/src/ui/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Sign up | GR8BooksLite",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
