export const AuthSessionExpiredEventName = "gr8books:auth-session-expired";
export const AuthLogoutStartedEventName = "gr8books:auth-logout-started";

let isIntentionalLogoutInProgress = false;

export function BeginIntentionalLogout() {
	if (typeof window === "undefined") {
		return;
	}

	isIntentionalLogoutInProgress = true;
	window.dispatchEvent(new Event(AuthLogoutStartedEventName));
}

export function IsIntentionalLogoutInProgress() {
	return isIntentionalLogoutInProgress;
}

export function NotifyAuthSessionExpired() {
	if (
		typeof window === "undefined" ||
		IsIntentionalLogoutInProgress()
	) {
		return;
	}

	window.dispatchEvent(new Event(AuthSessionExpiredEventName));
}
