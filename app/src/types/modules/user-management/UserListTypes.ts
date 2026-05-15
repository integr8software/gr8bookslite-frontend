export type UserListStatus = "Active" | "Pending" | "Inactive";

export type UserListRecord = {
  id: string;
  name: string;
  username: string;
  email: string;
  contactNo: string;
  department: string;
  userType: string;
  userGroup: string;
  status: UserListStatus;
  lastLogin: string;
  lastLoginMeta: string;
  profileImageUrl?: string;
};
