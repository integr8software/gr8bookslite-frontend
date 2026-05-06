import type { Metadata } from "next";
import { OtpForm } from "@/app/src/ui/auth/OtpForm";

export const metadata: Metadata = {
  title: "OTP verification | GR8BooksLite",
};

export default function OtpPage() {
  return <OtpForm />;
}
