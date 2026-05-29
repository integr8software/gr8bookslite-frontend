"use client";

import { useEffect } from "react";
import toast, {
	Toaster,
	type ToasterProps,
	useToasterStore,
} from "react-hot-toast";

type AppToasterProps = Pick<
	ToasterProps,
	"position" | "reverseOrder" | "toasterId"
>;

const VisibleToastLimit = 1;
const ToastExitAnimationDelay = 450;

export function AppToaster(props: AppToasterProps) {
	return (
		<>
			<AppToastLimiter toasterId={props.toasterId} />
			<Toaster
				position={props.position}
				reverseOrder={props.reverseOrder}
				toasterId={props.toasterId}
				toastOptions={{
					duration: 3500,
					removeDelay: ToastExitAnimationDelay,
					style: {
						borderRadius: "14px",
						background: "#ffffff",
						color: "#212738",
						boxShadow: "0 18px 60px rgba(33, 39, 56, 0.14)",
						border: "1px solid rgba(33, 39, 56, 0.08)",
					},
					success: {
						style: {
							border: "1px solid rgba(34, 197, 94, 0.28)",
						},
					},
					error: {
						style: {
							border: "1px solid rgba(249, 112, 104, 0.28)",
						},
					},
				}}
			/>
		</>
	);
}

function AppToastLimiter({ toasterId }: { toasterId?: string }) {
	const { toasts } = useToasterStore(undefined, toasterId);

	useEffect(() => {
		const visibleToasts = toasts
			.filter((candidate) => !candidate.dismissed)
			.sort((current, next) => next.createdAt - current.createdAt);

		if (visibleToasts.length <= VisibleToastLimit) {
			return;
		}

		visibleToasts.slice(VisibleToastLimit).forEach((candidate) => {
			toast.dismiss(candidate.id, candidate.toasterId ?? toasterId);
		});
	}, [toasterId, toasts]);

	return null;
}
