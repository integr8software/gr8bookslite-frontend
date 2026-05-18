"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { SaveAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { Gr8BooksLoadingScreen } from "@/app/src/ui/shared/Gr8BooksLoadingScreen";
import {
  GetFallbackPostAuthRedirectPath,
  IsSystemRedirectPath,
  ResolvePostAuthDestination,
} from "@/app/src/services/auth/AuthRedirects";
import { useAppStore } from "@/app/src/hooks/shared/useAppStore";

function ReadRedirectPath(mode: string | null) {
	return mode === "signup" ? "/signup" : "/login";
}

export default function GoogleAuthCallbackPage() {
	return (
		<Suspense fallback={<Gr8BooksLoadingScreen />}>
			<GoogleAuthCallbackContent />
		</Suspense>
	);
}

function GoogleAuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const setActiveCompanyId = useAppStore((state) => state.setActiveCompanyId);
	const setAccessToken = useAppStore((state) => state.setAccessToken);
	const [isSystemRedirecting, setIsSystemRedirecting] = useState(true);

	useEffect(() => {
		const hashParams = new URLSearchParams(window.location.hash.slice(1));
		const accessToken = hashParams.get("accessToken");
		const error = searchParams.get("error");
		const mode = searchParams.get("mode");

		if (accessToken) {
			SaveAccessToken(accessToken, false);
			setAccessToken(accessToken);
			toast.success("Google sign-in successful.");
			void ResolvePostAuthDestination(accessToken)
				.then(({ profile, redirectPath }) => {
					setActiveCompanyId(profile.activeCompanyId);
					setIsSystemRedirecting(IsSystemRedirectPath(redirectPath));
					router.replace(redirectPath);
				})
				.catch(() => {
					const fallbackPath = GetFallbackPostAuthRedirectPath(accessToken);

					setIsSystemRedirecting(IsSystemRedirectPath(fallbackPath));
					router.replace(fallbackPath);
				});
			return;
		}

		toast.error(error ?? "Google sign-in could not be completed.");
		router.replace(ReadRedirectPath(mode));
	}, [router, searchParams, setAccessToken, setActiveCompanyId]);

	if (isSystemRedirecting) {
		return <Gr8BooksLoadingScreen />;
	}

	return <GoogleAuthCallbackMessage />;
}

function GoogleAuthCallbackMessage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-darknavy">
			<p className="text-sm text-darknavy/70">
				Finishing your Google sign-in...
			</p>
		</main>
	);
}
