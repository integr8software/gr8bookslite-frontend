import type { Metadata } from "next";
import { SignUpForm } from "@/app/src/ui/auth/SignUpForm";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
  title: `Sign up | ${AppName}`,
};

export default function SignUpPage() {
  return <SignUpForm />;
}
