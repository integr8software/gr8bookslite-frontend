import type { Metadata } from "next";
import { LoginForm } from "@/app/src/ui/auth/LoginForm";
import { AppName } from "@/app/src/constants/shared/AppConstants";

export const metadata: Metadata = {
  title: `Log in | ${AppName}`,
};

export default function LoginPage() {
  return <LoginForm />;
}
