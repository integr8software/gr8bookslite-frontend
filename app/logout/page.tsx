import type { Metadata } from "next";
import { LogoutPage } from "@/app/src/ui/auth/LogoutPage";

export const metadata: Metadata = {
  title: "Log out | GR8BooksLite",
};

export default function LogoutRoutePage() {
  return <LogoutPage />;
}
