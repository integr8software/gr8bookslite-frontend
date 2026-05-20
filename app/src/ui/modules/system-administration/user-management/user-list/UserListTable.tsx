import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Eye,
  Search,
  UserCircle,
} from "lucide-react";
import type {
  UserGroupRecord,
  UserManagementRecord,
  UserStatus,
  UserTypeRecord,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";

const PageSizeOptions = [8, 10, 25] as const;

type SortKey = "name" | "email" | "userType" | "userGroup" | "status" | "lastLogin";

type SortState = {
  direction: "asc" | "desc";
  key: SortKey;
};

export function UserListTable({
  userGroups,
  users,
  userTypes,
}: {
  userGroups: UserGroupRecord[];
  users: UserManagementRecord[];
  userTypes: UserTypeRecord[];
  onDelete: (id: string, name: string) => void;
}) {
  const [groupFilter, setGroupFilter] = useState("All");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<(typeof PageSizeOptions)[number]>(8);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [sort, setSort] = useState<SortState>({
    direction: "asc",
    key: "name",
  });
  const [typeFilter, setTypeFilter] = useState("All");
  const groupNames = useMemo(
    () => userGroups.map((group) => group.name).sort(),
    [userGroups],
  );
  const typeNames = useMemo(
    () => userTypes.map((type) => type.name).sort(),
    [userTypes],
  );
  const filteredUsers = useMemo(
    () => {
      const filtered = users.filter((user) => {
        const userType = userTypes.find((type) => type.id === user.userTypeId);
        const userGroup = userGroups.find(
          (group) => group.id === user.userGroupId,
        );
        const searchable = [
          user.name,
          user.email,
          user.contactNumber,
          userType?.name,
          userGroup?.name,
          user.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          searchable.includes(query.toLowerCase()) &&
          (statusFilter === "All" || user.status === statusFilter) &&
          (typeFilter === "All" || userType?.name === typeFilter) &&
          (groupFilter === "All" || userGroup?.name === groupFilter)
        );
      });

      return filtered.sort((firstUser, secondUser) => {
        const firstValue = getSortValue(firstUser, sort.key, userTypes, userGroups);
        const secondValue = getSortValue(
          secondUser,
          sort.key,
          userTypes,
          userGroups,
        );
        const result = firstValue.localeCompare(secondValue);

        return sort.direction === "asc" ? result : -result;
      });
    },
    [
      groupFilter,
      query,
      sort,
      statusFilter,
      typeFilter,
      userGroups,
      userTypes,
      users,
    ],
  );
  const pageCount = Math.max(Math.ceil(filteredUsers.length / pageSize), 1);
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageUsers = filteredUsers.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize,
  );
  const firstItem = filteredUsers.length ? safePageIndex * pageSize + 1 : 0;
  const lastItem = Math.min(filteredUsers.length, firstItem + pageUsers.length - 1);
  const visiblePages = getVisiblePages(safePageIndex, pageCount);

  function resetFilters() {
    setGroupFilter("All");
    setPageIndex(0);
    setQuery("");
    setStatusFilter("All");
    setTypeFilter("All");
  }

  function updateFilter(update: () => void) {
    update();
    setPageIndex(0);
  }

  function updateSort(key: SortKey) {
    setSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setPageIndex(0);
  }

  return (
    <div
      className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm"
      data-spotlight-id="user-list-table"
    >
      <div
        className="flex flex-wrap items-center gap-3 border-b border-darknavy/10 px-4 py-3"
        data-spotlight-id="user-list-filters"
      >
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) =>
              updateFilter(() => setQuery(event.target.value))
            }
            placeholder="Search users..."
            className="h-9 w-full rounded border border-darknavy/10 bg-white pl-9 pr-3 text-xs text-darknavy outline-none transition placeholder:text-darknavy/38 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
          />
        </div>
        <div className="grid min-w-full flex-1 gap-3 sm:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
          <ToolbarSelect
            label="Status"
            value={statusFilter}
            options={["All", "Active", "Inactive", "Pending"]}
            onChange={(value) =>
              updateFilter(() => setStatusFilter(value as UserStatus | "All"))
            }
          />
          <ToolbarSelect
            label="User Type"
            value={typeFilter}
            options={["All", ...typeNames]}
            onChange={(value) => updateFilter(() => setTypeFilter(value))}
          />
          <ToolbarSelect
            label="User Group"
            value={groupFilter}
            options={["All", ...groupNames]}
            onChange={(value) => updateFilter(() => setGroupFilter(value))}
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-9 items-center justify-center rounded border border-darknavy/10 bg-white px-4 text-xs font-semibold text-darknavy/50 transition hover:border-skyblue/45 hover:text-darknavy"
        >
          Reset
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-darknavy/[0.02]">
              {[
                { key: "name", label: "Full Name", className: "w-[18rem]" },
                { key: "email", label: "Email", className: "w-[22rem]" },
                { key: "userType", label: "User Type", className: "w-[12rem]" },
                { key: "userGroup", label: "User Group", className: "w-[13rem]" },
                { key: "status", label: "Status", className: "w-[11rem]" },
                { key: "lastLogin", label: "Last Login", className: "w-[16rem]" },
              ].map((header) => (
                  <TableHeader key={header.label} className={header.className}>
                    <button
                      type="button"
                      onClick={() => updateSort(header.key as SortKey)}
                      className="inline-flex items-center gap-1.5 rounded text-left transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
                    >
                      {header.label}
                      {sort.key === header.key && sort.direction === "desc" ? (
                        <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
                      ) : (
                        <ChevronDown
                          className={[
                            "h-3.5 w-3.5",
                            sort.key === header.key
                              ? "text-blue-600"
                              : "text-darknavy/35",
                          ].join(" ")}
                        />
                      )}
                    </button>
                  </TableHeader>
                ))}
              <TableHeader className="w-[8rem] text-center">Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {pageUsers.length ? (
              pageUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  userGroup={userGroups.find(
                    (group) => group.id === user.userGroupId,
                  )}
                  userType={userTypes.find((type) => type.id === user.userTypeId)}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-sm text-darknavy/55"
                >
                  No users match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 px-4 py-4 text-sm text-darknavy/60 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
        <p className="text-center lg:text-left">
          Showing {firstItem} to {lastItem} of {filteredUsers.length} users
        </p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <PaginationIconButton
            disabled={safePageIndex === 0}
            label="First page"
            onClick={() => setPageIndex(0)}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </PaginationIconButton>
          <PaginationTextButton
            disabled={safePageIndex === 0}
            onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
          >
            Prev
          </PaginationTextButton>
          <div className="mx-1 flex items-center gap-1">
            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setPageIndex(page)}
                aria-current={page === safePageIndex ? "page" : undefined}
                className={[
                  "flex h-9 min-w-9 items-center justify-center rounded border px-3 text-sm font-semibold transition",
                  page === safePageIndex
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                    : "border-darknavy/10 bg-white text-darknavy hover:border-skyblue/45 hover:bg-skyblue/8",
                ].join(" ")}
              >
                {page + 1}
              </button>
            ))}
          </div>
          <PaginationTextButton
            disabled={safePageIndex >= pageCount - 1}
            onClick={() =>
              setPageIndex((current) => Math.min(current + 1, pageCount - 1))
            }
          >
            Next
          </PaginationTextButton>
          <PaginationIconButton
            disabled={safePageIndex >= pageCount - 1}
            label="Last page"
            onClick={() => setPageIndex(pageCount - 1)}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </PaginationIconButton>
        </div>
        <label className="flex items-center justify-center gap-2 lg:justify-end">
          <span className="text-sm font-medium text-darknavy/55">Rows</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value) as typeof pageSize);
              setPageIndex(0);
            }}
            className="h-9 rounded border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none focus:ring-2 focus:ring-skyblue/25"
          >
            {PageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function UserRow({
  user,
  userGroup,
  userType,
}: {
  user: UserManagementRecord;
  userGroup?: UserGroupRecord;
  userType?: UserTypeRecord;
}) {
  return (
    <tr className="transition hover:bg-skyblue/[0.04]">
      <td className="border-b border-darknavy/8 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {user.profileImageUrl ? (
            <span
              aria-hidden="true"
              className="block h-8 w-8 shrink-0 rounded-full bg-cover bg-center ring-1 ring-darknavy/10"
              style={{ backgroundImage: `url("${user.profileImageUrl}")` }}
            />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-skyblue/18 text-darknavy ring-1 ring-darknavy/10">
              <UserCircle className="h-4 w-4" aria-hidden="true" />
            </span>
          )}
          <span className="truncate text-xs font-semibold text-darknavy">
            {user.name}
          </span>
        </div>
      </td>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <span className="inline-flex min-h-6 items-center rounded bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
          {userType?.name ?? "-"}
        </span>
      </TableCell>
      <TableCell>{userGroup?.name ?? "-"}</TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
      <TableCell>{user.lastLogin ?? "-"}</TableCell>
      <TableCell align="center">
        <div className="flex items-center justify-center gap-1.5">
          <ActionLink href={`${UserListHref}/edit/${user.id}`} label="Edit">
            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
          </ActionLink>
          <ActionLink href={`${UserListHref}/view/${user.id}`} label="View">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          </ActionLink>
        </div>
      </TableCell>
    </tr>
  );
}

function ToolbarSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-darknavy/48">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 flex-1 rounded border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TableHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-darknavy/10 px-4 py-3 text-left text-xs font-semibold text-darknavy/70 first:pl-5 last:pr-5 ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  align = "left",
  children,
}: {
  align?: "center" | "left";
  children: React.ReactNode;
}) {
  return (
    <td
      className={`border-b border-darknavy/8 px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5 ${
        align === "center" ? "text-center" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const classes = {
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Pending: "bg-amber-50 text-amber-700 ring-amber-100",
    Inactive: "bg-orange-50 text-orange-700 ring-orange-100",
  } satisfies Record<UserStatus, string>;

  return (
    <span
      className={`inline-flex min-h-6 items-center rounded px-2.5 text-xs font-semibold ring-1 ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function ActionLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded border border-darknavy/10 text-darknavy/60 transition hover:border-skyblue/45 hover:bg-skyblue/8 hover:text-darknavy"
    >
      {children}
    </Link>
  );
}

function PaginationIconButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded border border-darknavy/10 bg-white text-darknavy transition hover:border-skyblue/45 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PaginationTextButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 items-center justify-center rounded border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy transition hover:border-skyblue/45 hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function getSortValue(
  user: UserManagementRecord,
  key: SortKey,
  userTypes: UserTypeRecord[],
  userGroups: UserGroupRecord[],
) {
  const userType = userTypes.find((type) => type.id === user.userTypeId);
  const userGroup = userGroups.find((group) => group.id === user.userGroupId);

  const values = {
    email: user.email,
    lastLogin: user.lastLogin ?? "",
    name: user.name,
    status: user.status,
    userGroup: userGroup?.name ?? "",
    userType: userType?.name ?? "",
  } satisfies Record<SortKey, string>;

  return values[key].toLowerCase();
}

function getVisiblePages(currentPage: number, pageCount: number) {
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  const start = Math.max(
    0,
    Math.min(currentPage - halfWindow, pageCount - windowSize),
  );
  const length = Math.min(windowSize, pageCount);

  return Array.from({ length }, (_, index) => start + index);
}
