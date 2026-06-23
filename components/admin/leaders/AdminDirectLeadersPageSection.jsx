"use client";

import { useState } from "react";
import { LoaderCircle, Lock, RefreshCw, ShieldCheck, Unlock, UsersRound } from "lucide-react";
import AdminLeaderProblemsPanel from "@/components/admin/leaders/AdminLeaderProblemsPanel";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getDirectLeaders, toggleManagedUserLock } from "@/lib/client/usersClient";
import {
  buildManagedUserFilterQueryParams,
  createManagedUserFilters,
  MANAGED_USER_PAGE_SIZE,
} from "@/lib/managedUserFilters";
import { toastAlert } from "@/lib/toastAlert";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function buildAreaLine(leader) {
  return [leader.ward, leader.panchayat, leader.block, leader.district]
    .filter(Boolean)
    .join(" • ");
}

function paymentPillClass(status) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "unpaid") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-slate-100 text-slate-900";
}

export default function AdminDirectLeadersPageSection() {
  const [lockingId, setLockingId] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getDirectLeaders({
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
        counts: { leaders: 0 },
      },
      onError: (error) => {
        toastAlert("error", error.response?.data?.message || error.message || "Unable to load direct leaders.");
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

  const handleToggleLock = async (leader) => {
    try {
      setLockingId(leader.id);
      await toggleManagedUserLock(leader.id, !leader.isLocked);
      toastAlert("success", leader.isLocked ? "Leader unlocked successfully." : "Leader locked successfully.");
      await refresh();
    } catch (error) {
      toastAlert("error", error.response?.data?.message || error.message || "Unable to update leader status.");
    } finally {
      setLockingId("");
    }
  };

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">
                Direct leaders
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
              Standalone leader accounts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These leaders registered directly and do not belong to any candidate.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={`/api/users/direct-leaders/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:w-auto"
            >
              Export CSV
            </a>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isRefreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">Direct leaders</h3>
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-900">
            {data.counts?.leaders ?? 0} total
          </span>
        </div>

        <ManagedUserFilters
          title="Leader filters"
          filters={filters}
          onChange={handleFilterChange}
          onClear={() => {
            setPage(1);
            setFilters(createManagedUserFilters());
          }}
          resultCount={data.pagination?.itemCount ?? data.leaders?.length ?? 0}
          totalCount={data.pagination?.totalItems ?? data.leaders?.length ?? 0}
          searchPlaceholder="Name | Phone | Block"
        />

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading direct leaders...
            </div>
          </div>
        ) : data.leaders.length ? (
          <div className="space-y-3">
            {data.leaders.map((leader) => (
              <article
                key={leader.id}
                className="rounded-[1.15rem] border border-border/60 bg-background/75 p-4 sm:rounded-[1.25rem] sm:p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-900">
                        Leader
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-muted-foreground">
                        <ShieldCheck className="size-3.5" />
                        {leader.isEmailVerified ? "Verified" : "Pending"}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${leader.isLocked ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"}`}>
                        {leader.isLocked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                        {leader.isLocked ? "Locked" : "Active"}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${paymentPillClass(leader.registrationPaymentStatus)}`}>
                        {leader.registrationPaymentStatus || "pending"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)] xl:items-center">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Leader
                        </p>
                        <h4 className="mt-1 truncate text-base font-semibold text-foreground">{leader.name}</h4>
                        <p className="truncate text-sm text-muted-foreground">{leader.email}</p>
                        {leader.currentParty || leader.politicalPosition ? (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {[leader.currentParty, leader.politicalPosition].filter(Boolean).join(" • ")}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Coverage
                        </p>
                        <p className="mt-1 text-sm text-foreground">{leader.vidhansabha || "Not set"}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {buildAreaLine(leader) || leader.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Strength
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {leader.activeWorkerCount ?? 0} workers
                        </p>
                        <p className="text-xs text-muted-foreground">{leader.totalVoters ?? 0} voters</p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Created
                        </p>
                        <p className="mt-1 text-sm text-foreground">{formatDate(leader.createdAt)}</p>
                      </div>
                    </div>

                    {leader.isLocked && leader.lockReason ? (
                      <p className="mt-2 line-clamp-2 text-xs text-rose-700">{leader.lockReason}</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 xl:min-w-[170px] xl:items-end">
                    <div className="rounded-2xl bg-sky-500 p-2.5 text-white shadow-lg">
                      <UsersRound className="size-4.5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleLock(leader)}
                      disabled={lockingId === leader.id}
                      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto ${leader.isLocked ? "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" : "border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"}`}
                    >
                      {lockingId === leader.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : leader.isLocked ? (
                        <Unlock className="size-4" />
                      ) : (
                        <Lock className="size-4" />
                      )}
                      {leader.isLocked ? "Unlock" : "Lock"}
                    </button>
                  </div>
                </div>

                <AdminLeaderProblemsPanel
                  leaderId={leader.id}
                  leaderName={leader.name}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground">
            No direct leaders match the selected filters.
          </div>
        )}

        <PaginationControls pagination={data.pagination} onPageChange={setPage} />
      </section>
    </section>
  );
}
