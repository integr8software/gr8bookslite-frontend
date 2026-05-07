import type { Metadata } from "next";
import { OtpForm } from "@/app/src/ui/auth/OtpForm";

export const metadata: Metadata = {
  title: "OTP verification | GR8BooksLite",
};

type OtpPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

function ReadInitialEmail(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function OtpPage({ searchParams }: OtpPageProps) {
  const { email } = await searchParams;

  return <OtpForm initialEmail={ReadInitialEmail(email)} />;
}
