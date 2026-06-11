import { ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import type { MainTopbarUser } from "@/app/src/types/shared/main-layout/MainTopbarTypes";
import {
	ProfileHref,
	SettingsHref,
} from "@/app/src/constants/shared/account/AccountConstants";
import {
	MenuSeparator,
	ProfileMenuButton,
	ProfileMenuLink,
} from "@/app/src/ui/shared/main-layout/main-topbar/MenuPrimitives";
import { TopbarProfileSkeleton } from "@/app/src/ui/shared/main-layout/main-topbar/TopbarSkeletons";
import { UserAvatar } from "@/app/src/ui/shared/main-layout/main-topbar/UserAvatar";

type AccountMenuProps = {
	currentUser: MainTopbarUser;
	isOpen: boolean;
	isProfileLoading: boolean;
	userDescriptor?: string;
	onClose: () => void;
	onLogout: () => void;
	onToggle: () => void;
};

export function AccountMenu({
	currentUser,
	isOpen,
	isProfileLoading,
	userDescriptor,
	onClose,
	onLogout,
	onToggle,
}: AccountMenuProps) {
	return (
		<div className="relative" data-main-profile-root>
			{isProfileLoading ? (
				<TopbarProfileSkeleton />
			) : (
				<button
					type="button"
					onClick={onToggle}
					aria-expanded={isOpen}
					className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-darknavy/20 bg-white p-0.5 text-left shadow-sm transition-all duration-200 ease-out hover:border-skyblue/55 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md xl:justify-start xl:pr-2"
				>
					<UserAvatar
						currentUser={currentUser}
						className="h-8 w-8 md:rounded-md"
					/>
					<span className="hidden min-w-0 max-w-44 xl:block 2xl:max-w-56">
						<span className="block truncate text-sm font-semibold leading-4 text-darknavy">
							{currentUser.name}
						</span>
						{userDescriptor ? (
							<span className="block truncate text-xs text-darknavy/55">
								{userDescriptor}
							</span>
						) : null}
					</span>
					<ChevronDown
						className="hidden h-4 w-4 shrink-0 text-darknavy/50 xl:block"
						aria-hidden="true"
					/>
				</button>
			)}

			{isOpen ? (
				<div className="fixed right-3 top-16 z-60 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 shadow-[0_24px_70px_rgba(33,39,56,0.18)] sm:right-4 lg:right-6">
					<AccountDetails
						currentUser={currentUser}
						userDescriptor={userDescriptor}
					/>
					<MenuSeparator />
					<ProfileMenuLink
						href={ProfileHref}
						icon={UserCircle}
						label="Profile"
						onClick={onClose}
					/>
					<ProfileMenuLink
						href={SettingsHref}
						icon={Settings}
						label="Settings"
						onClick={onClose}
					/>
					<ProfileMenuButton
						icon={LogOut}
						label="Logout"
						onClick={() => {
							onClose();
							onLogout();
						}}
					/>
				</div>
			) : null}
		</div>
	);
}

type AccountDetailsProps = {
	currentUser: MainTopbarUser;
	userDescriptor?: string;
};

function AccountDetails({
	currentUser,
	userDescriptor,
}: AccountDetailsProps) {
	return (
		<div className="px-3 py-3">
			<p className="text-xs font-semibold uppercase text-darknavy/45">
				Account Details
			</p>
			<div className="mt-3 flex items-start gap-3">
				<UserAvatar
					currentUser={currentUser}
					className="h-9 w-9 rounded-md"
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold text-darknavy">
						{currentUser.name}
					</p>

					{userDescriptor ? (
						<p className="mt-0.5 truncate text-xs text-darknavy/45">
							{userDescriptor}
						</p>
					) : null}
				</div>
			</div>
		</div>
	);
}
