"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, LoaderCircle, Lock, RefreshCw, ShieldCheck, Unlock, UsersRound } from "lucide-react";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import AdminLeaderProblemsPanel from "@/components/admin/leaders/AdminLeaderProblemsPanel";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { ADMIN_CANDIDATES } from "@/routes/adminpanelRoutes";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getCandidateLeaders, toggleManagedUserLock } from "@/lib/client/usersClient";
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

export default function AdminCandidateLeadersPageSection({ candidateId }) {
  const [lockingId, setLockingId] = useState("");
  const [isMonthlyAttendanceOpen, setIsMonthlyAttendanceOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getCandidateLeaders(candidateId, {
        page,
        pageSize: MANAGED_USER_PAGE_SIZE,
        filters,
      }),
    {
      initialData: {
        candidate: null,
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
        counts: {
          leaders: 0,
          paidLeaders: 0,
          unpaidLeaders: 0,
          pendingLeaders: 0,
          attendanceDays: 0,
          todayRegistrations: 0,
          todayPaidRegistrations: 0,
          isPresentToday: false,
          currentMonthAttendance: 0,
          monthlyAttendance: [],
          attendanceRegistrationTarget: 12,
          attendancePaidTarget: 6,
        },
      },
      onError: (error) => {
        toastAlert("error", error.response?.data?.message || error.message || "Unable to load leaders.");
      },
      dependencyKey: JSON.stringify({ candidateId, page, filters }),
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
              <Link
                href={ADMIN_CANDIDATES}
                className="inline-flex rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Back
              </Link>
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-900">
                Candidate overview
              </span>
              {data.candidate?.isLocked ? (
                <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-900">
                  Candidate locked
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
              {data.candidate?.name || "Loading candidate"}
            </h2>
            {data.candidate ? (
              <div className="mt-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  {data.candidate.email} | {data.candidate.phone}
                </p>
                {data.candidate.isLocked && data.candidate.lockReason ? (
                  <p className="text-sm text-rose-700">{data.candidate.lockReason}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isRefreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Refresh
          </button>
          <a
            href={`/api/users/candidates/${candidateId}/leaders/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:w-auto"
          >
            Export CSV
          </a>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Overview
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Individual candidate summary</h3>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-border/60 bg-orange-50/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Leaders
            </p>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {data.counts?.leaders ?? 0}
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
              Paid leaders
            </p>
            <p className="mt-3 text-3xl font-semibold text-emerald-950">
              {data.counts?.paidLeaders ?? 0}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
              Unpaid leaders
            </p>
            <p className="mt-3 text-3xl font-semibold text-amber-950">
              {(data.counts?.unpaidLeaders ?? 0) + (data.counts?.pendingLeaders ?? 0)}
            </p>
          </article>

          <article className={`rounded-2xl border p-5 ${data.counts?.isPresentToday ? "border-emerald-200 bg-emerald-50/80" : "border-rose-200 bg-rose-50/80"}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${data.counts?.isPresentToday ? "text-emerald-800" : "text-rose-800"}`}>
              Attendance today
            </p>
            <p className={`mt-3 text-3xl font-semibold ${data.counts?.isPresentToday ? "text-emerald-950" : "text-rose-950"}`}>
              {data.counts?.isPresentToday ? "Present" : "Absent"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.counts?.todayRegistrations ?? 0}/{data.counts?.attendanceRegistrationTarget ?? 12} registrations,{" "}
              {data.counts?.todayPaidRegistrations ?? 0}/{data.counts?.attendancePaidTarget ?? 6} paid
            </p>
          </article>

          <article className="rounded-2xl border border-violet-200 bg-violet-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-800">
              Attendance days
            </p>
            <p className="mt-3 text-3xl font-semibold text-violet-950">
              {data.counts?.attendanceDays ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Days meeting the registration and paid target.
            </p>
          </article>

          <article className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-800">
              Current month
            </p>
            <p className="mt-3 text-3xl font-semibold text-indigo-950">
              {data.counts?.currentMonthAttendance ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attendance days recorded this month.
            </p>
          </article>
        </div>

        <section className="mt-4 rounded-2xl border border-border/60 bg-slate-50/70 p-5">
          <button
            type="button"
            onClick={() => setIsMonthlyAttendanceOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Monthly attendance
              </p>
              <h4 className="mt-1 text-base font-semibold text-foreground">
                Current and previous months
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Each attendance day requires 12 registrations with minimum 6 paid.
              </p>
            </div>
            <ChevronDown
              className={`size-5 shrink-0 text-muted-foreground transition ${isMonthlyAttendanceOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isMonthlyAttendanceOpen ? (
            <div className="mt-4 space-y-3">
              {data.counts?.monthlyAttendance?.length ? (
                data.counts.monthlyAttendance.map((month) => (
                  <article
                    key={month.monthKey}
                    className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-white/90 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{month.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {month.totalRegistrations} registrations • {month.totalPaidRegistrations} paid
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Attendance days
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">{month.attendanceDays}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-white/80 p-4 text-sm text-muted-foreground">
                  No monthly attendance data yet.
                </div>
              )}
            </div>
          ) : null}
        </section>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">Leaders</h3>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
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
              Loading leaders...
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
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
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

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_minmax(140px,0.8fr)] xl:items-center">
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
                        <p className="text-xs text-muted-foreground">
                          {leader.totalVoters ?? 0} voters • {formatDate(leader.createdAt)}
                        </p>
                      </div>
                    </div>

                    {leader.isLocked && leader.lockReason ? (
                      <p className="mt-2 line-clamp-2 text-xs text-rose-700">{leader.lockReason}</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 xl:min-w-[170px] xl:items-end">
                    <div className="rounded-2xl bg-orange-500 p-2.5 text-white shadow-lg">
                      <UsersRound className="size-4.5" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {formatDate(leader.createdAt)}
                    </p>
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
            No leaders match the selected filters.
          </div>
        )}

        <PaginationControls pagination={data.pagination} onPageChange={setPage} />
      </section>
    </section>
  );
}
