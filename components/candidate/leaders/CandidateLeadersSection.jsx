"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, RefreshCw, ShieldCheck, UsersRound } from "lucide-react";
import CreateManagedUserForm from "@/components/shared/forms/CreateManagedUserForm";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getLeaders } from "@/lib/client/usersClient";
import { INITIAL_MANAGED_USER_FILTERS, filterManagedUsers } from "@/lib/managedUserFilters";
import { toastAlert } from "@/lib/toastAlert";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CandidateLeadersSection() {
  const [filters, setFilters] = useState(INITIAL_MANAGED_USER_FILTERS);
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(getLeaders, {
    initialData: {
      leaders: [],
      counts: {
        leaders: 0,
        paidLeaders: 0,
        unpaidLeaders: 0,
        pendingLeaders: 0,
        attendanceDays: 0,
        todayRegistrations: 0,
        todayPaidRegistrations: 0,
        isPresentToday: false,
        attendanceRegistrationTarget: 12,
        attendancePaidTarget: 6,
      },
    },
    onError: (error) => {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to load leaders."
      );
    },
  });
  const filteredLeaders = useMemo(
    () => filterManagedUsers(data.leaders ?? [], filters),
    [data.leaders, filters]
  );

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "district" ? { vidhansabha: "" } : null),
    }));
  };

  return (
    <>
      <CreateManagedUserForm
        title="Create Leader"
        description="New leaders link to your account automatically."
        submitLabel="Create Leader"
        accentClass="from-sky-50 via-white to-cyan-50"
        submitButtonClass="bg-sky-600 text-white hover:bg-sky-700"
        onSuccess={refresh}
        sectionId="create-leader"
      />

      <section id="leader-list" className="rounded-[1.75rem] border border-border/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Leader directory
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Your leaders</h2>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isRefreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Refresh list
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-border/60 bg-sky-50/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Leaders in your branch
            </p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{data.counts?.leaders ?? 0}</p>
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
              {data.counts?.todayRegistrations ?? 0}/{data.counts?.attendanceRegistrationTarget ?? 12} registrations,
              {" "}
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
              Days meeting 12 registrations with minimum 6 paid.
            </p>
          </article>
        </div>

        <div className="mt-6">
          <ManagedUserFilters
            title="Leader filters"
            filters={filters}
            onChange={handleFilterChange}
            onClear={() => setFilters(INITIAL_MANAGED_USER_FILTERS)}
            resultCount={filteredLeaders.length}
            totalCount={data.leaders?.length ?? 0}
            searchPlaceholder="Name | Phone | Id No | Block"
          />

          <div className="mt-6">
          {isLoading ? (
            <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Loading leaders...
              </div>
            </div>
          ) : filteredLeaders.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredLeaders.map((leader) => (
                <article
                  key={leader.id}
                  className="rounded-[1.5rem] border border-border/60 bg-background/75 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-950">
                          Leader
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs text-muted-foreground">
                          <ShieldCheck className="size-3.5" />
                          {leader.isEmailVerified ? "Verified" : "Pending verification"}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">{leader.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{leader.email}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{leader.phone}</p>
                    </div>

                    <div className="rounded-2xl bg-sky-500 p-3 text-white shadow-lg">
                      <UsersRound className="size-5" />
                    </div>
                  </div>

                  <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Created {formatDate(leader.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground">
              {data.leaders?.length
                ? "No leaders match the selected filters."
                : "No leaders found yet. Create your first leader to expand your branch."}
            </div>
          )}
          </div>
        </div>
      </section>
    </>
  );
}
