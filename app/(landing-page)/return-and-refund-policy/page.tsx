import type { Metadata } from "next";
import ReturnAndRefundPolicyForm from "@/app/src/ui/auth/ReturnAndRefundPolicyForm";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const metadata: Metadata = {
	title: `Return & Refund Policy | ${AppName}`,
	description: `Read the return and refund policy for ${AppName} subscriptions and services.`,
};

export default function ReturnAndRefundPolicyPage() {
	return <ReturnAndRefundPolicyForm />;
}
