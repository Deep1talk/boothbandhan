"use client";

import { useState } from "react";
import CandidateLeadersListSection from "@/components/candidate/leaders/CandidateLeadersListSection";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  buildManagedUserFilterQueryParams,
  createManagedUserFilters,
  MANAGED_USER_PAGE_SIZE,
} from "@/lib/managedUserFilters";
import { getLeaders } from "@/lib/client/usersClient";
import { toastAlert } from "@/lib/toastAlert";

export default function CandidateLeadersListPageSection() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getLeaders({
        page,
        pageSize: MANAGED_USER_PAGE_SIZE,
        filters,
      }),
    {
      initialData: {
        leaders: [],
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
        toastAlert("error", error.response?.data?.message || error.message || "Unable to load leaders.");
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

  return (
    <CandidateLeadersListSection
      leaders={data.leaders ?? []}
      pagination={data.pagination}
      exportHref={`/api/users/leaders/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={() => {
        setPage(1);
        setFilters(createManagedUserFilters());
      }}
      onPageChange={setPage}
      onRefresh={refresh}
    />
  );
}
