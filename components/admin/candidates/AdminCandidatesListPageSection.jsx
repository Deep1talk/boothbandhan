"use client";

import { useState } from "react";
import AdminCandidatesListSection from "@/components/admin/candidates/AdminCandidatesListSection";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  buildManagedUserFilterQueryParams,
  createManagedUserFilters,
  MANAGED_USER_PAGE_SIZE,
} from "@/lib/managedUserFilters";
import { getCandidates, toggleManagedUserLock } from "@/lib/client/usersClient";
import { toastAlert } from "@/lib/toastAlert";

export default function AdminCandidatesListPageSection() {
  const [lockingId, setLockingId] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getCandidates({
        page,
        pageSize: MANAGED_USER_PAGE_SIZE,
        filters,
      }),
    {
      initialData: {
        candidates: [],
        pagination: {
          page: 1,
          pageSize: MANAGED_USER_PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
          itemCount: 0,
          startIndex: 0,
          endIndex: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
      onError: (error) => {
        toastAlert(
          "error",
          error.response?.data?.message || error.message || "Unable to load candidates."
        );
      },
      dependencyKey: JSON.stringify({ page, filters }),
    }
  );

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "district" ? { vidhansabha: "" } : null),
    }));
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters(createManagedUserFilters());
  };

  const handleToggleLock = async (managedUser) => {
    try {
      setLockingId(managedUser.id);
      await toggleManagedUserLock(managedUser.id, !managedUser.isLocked);
      toastAlert(
        "success",
        managedUser.isLocked
          ? `${managedUser.role} unlocked successfully.`
          : `${managedUser.role} locked successfully.`
      );
      await refresh();
    } catch (error) {
      toastAlert("error", error.response?.data?.message || error.message || "Unable to update user status.");
    } finally {
      setLockingId("");
    }
  };

  return (
    <AdminCandidatesListSection
      candidates={data.candidates ?? []}
      pagination={data.pagination}
      exportHref={`/api/users/candidates/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      lockingId={lockingId}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onPageChange={setPage}
      onRefresh={refresh}
      onToggleLock={handleToggleLock}
    />
  );
}
