"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ClipboardList,
  Download,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getAdminAllLeaderProblems } from "@/lib/client/usersClient";
import {
  buildManagedUserFilterQueryParams,
  createManagedUserFilters,
  MANAGED_USER_PAGE_SIZE,
} from "@/lib/managedUserFilters";
import { HELP_DESK_ISSUE_OPTIONS } from "@/lib/helpDeskOptions";
import { toastAlert } from "@/lib/toastAlert";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusPillClass(status) {
  if (status === "resolved") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "in_review") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-slate-100 text-slate-900";
}

function buildLeaderArea(problem) {
  return [
    problem.leader?.ward,
    problem.leader?.panchayat,
    problem.leader?.block,
    problem.leader?.district,
  ]
    .filter(Boolean)
    .join(" • ");
}

export default function AdminAllLeaderProblemsPageSection() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const issueLabelMap = useMemo(
    () =>
      HELP_DESK_ISSUE_OPTIONS.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {}),
    []
  );
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getAdminAllLeaderProblems({
        page,
        pageSize: MANAGED_USER_PAGE_SIZE,
        filters,
      }),
    {
      initialData: {
        problems: [],
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
        counts: {
          problems: 0,
          newProblems: 0,
          inReviewProblems: 0,
          resolvedProblems: 0,
          directLeaderProblems: 0,
          managedLeaderProblems: 0,
        },
      },
      onError: (error) => {
        toastAlert(
          "error",
          error.response?.data?.message ||
            error.message ||
            "Unable to load leader problems."
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

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-900">
                Help desk
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
              All leader problems in one place
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review every help-desk submission across direct and managed leaders with one shared filter panel.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={`/api/help-desk/leaders/problems/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:w-auto"
            >
              <Download className="size-4" />
              Export CSV
            </a>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isRefreshing ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Problem submissions
          </h3>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-900">
            {data.counts?.problems ?? 0} total
          </span>
        </div>

        <ManagedUserFilters
          title="Problem filters"
          filters={filters}
          showStatus={false}
          showBloodGroup={false}
          showLeaderManagementFilters={false}
          statusOptions={[]}
          onChange={handleFilterChange}
          onClear={() => {
            setPage(1);
            setFilters(createManagedUserFilters());
          }}
          resultCount={data.pagination?.itemCount ?? data.problems?.length ?? 0}
          totalCount={data.pagination?.totalItems ?? data.problems?.length ?? 0}
          searchPlaceholder="Leader | Parent | Family head | Mobile | Block"
        />

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading problems...
            </div>
          </div>
        ) : data.problems.length ? (
          <div className="space-y-3">
            {data.problems.map((problem) => (
              <article
                key={problem.id}
                className="rounded-[1.15rem] border border-border/60 bg-background/75 p-4 sm:rounded-[1.25rem] sm:p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-900">
                        {problem.leader?.name || "Leader"}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                          problem.leader?.leaderSource === "direct"
                            ? "bg-sky-100 text-sky-900"
                            : "bg-violet-100 text-violet-900"
                        }`}
                      >
                        {problem.leader?.leaderSource === "direct"
                          ? "Direct"
                          : "Managed"}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusPillClass(
                          problem.status
                        )}`}
                      >
                        {problem.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)]">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Leader
                        </p>
                        <h4 className="mt-1 text-base font-semibold text-foreground">
                          {problem.leader?.name || "Unknown leader"}
                        </h4>
                        <p className="truncate text-sm text-muted-foreground">
                          {problem.leader?.phone || "Phone not added"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {problem.leaderParent?.name || "Direct registration"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Family head
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {problem.headOfFamilyName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {problem.mobileNumber}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {problem.localAddress || "Address not added"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Coverage
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {problem.leader?.vidhansabha || "Not set"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {buildLeaderArea(problem) || "Area details not added"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {problem.issueCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900"
                        >
                          {issueLabelMap[category] || category}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-foreground/90">
                      {problem.issueDetails}
                    </p>

                    {problem.verifierComment ? (
                      <div className="mt-4 rounded-xl border border-border/60 bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Verifier comment
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground/90">
                          {problem.verifierComment}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="xl:w-[230px]">
                    <div className="rounded-2xl border border-border/60 bg-white/90 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ClipboardList className="size-4 text-orange-600" />
                        Submission details
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatDate(problem.createdAt)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {[problem.wardNumber, problem.panchayat, problem.block]
                          .filter(Boolean)
                          .join(" • ") || "Problem area not added"}
                      </p>
                      {typeof problem.wantsToJoinOrganization === "boolean" ? (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Wants to join:{" "}
                          {problem.wantsToJoinOrganization ? "Yes" : "No"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-orange-700" />
            No leader problems match the selected filters.
          </div>
        )}

        <PaginationControls pagination={data.pagination} onPageChange={setPage} />
      </section>
    </section>
  );
}
