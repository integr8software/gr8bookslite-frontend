export const AuthSessionExpiredEventName = "gr8books:auth-session-expired";

export function NotifyAuthSessionExpired() {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new Event(AuthSessionExpiredEventName));
}
