"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, Lock, RefreshCw, ShieldCheck, Unlock, UsersRound } from "lucide-react";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { getAdminCandidateLeadersRoute, getAdminCandidateOverviewRoute } from "@/routes/adminpanelRoutes";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminCandidatesListSection({
  candidates,
  pagination,
  exportHref,
  isLoading,
  isRefreshing,
  lockingId,
  filters,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onRefresh,
  onToggleLock,
}) {
  const router = useRouter();

  return (
    <section
      id="candidate-list"
      className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Candidate list
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
            Candidates
          </h2>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={exportHref}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:w-auto"
          >
            Export CSV
          </a>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isRefreshing ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh list
          </button>
        </div>
      </div>

      <ManagedUserFilters
        title="Candidate filters"
        filters={filters}
        onChange={onFilterChange}
        onClear={onClearFilters}
        resultCount={pagination?.itemCount ?? candidates?.length ?? 0}
        totalCount={pagination?.totalItems ?? candidates?.length ?? 0}
        searchPlaceholder="Name | Phone | Block"
      />

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading candidates...
            </div>
          </div>
        ) : candidates.length ? (
          candidates.map((candidate) => (
            <article
              key={candidate.id}
              role="link"
              tabIndex={0}
              onClick={() => router.push(getAdminCandidateOverviewRoute(candidate.id))}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(getAdminCandidateOverviewRoute(candidate.id));
                }
              }}
              className="cursor-pointer rounded-[1.2rem] border border-border/60 bg-background/75 p-4 transition hover:border-orange-200 hover:bg-orange-50/40 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:rounded-[1.35rem] sm:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-900">
                      Candidate
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-muted-foreground">
                      <UsersRound className="size-3.5" />
                      {candidate.leadersCount ?? candidate.leaders?.length ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-muted-foreground">
                      <ShieldCheck className="size-3.5" />
                      {candidate.isEmailVerified ? "Verified" : "Pending"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${candidate.isLocked ? "bg-rose-100 text-rose-900" : "bg-emerald-100 text-emerald-900"}`}>
                      {candidate.isLocked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                      {candidate.isLocked ? "Locked" : "Active"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_minmax(140px,0.8fr)_minmax(120px,0.8fr)] xl:items-center">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Candidate
                      </p>
                      <h3 className="mt-1 truncate text-base font-semibold text-foreground">
                        {candidate.name}
                      </h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {candidate.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Contact
                      </p>
                      <p className="mt-1 text-sm text-foreground">{candidate.phone}</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Created
                      </p>
                      <p className="mt-1 text-sm text-foreground">{formatDate(candidate.createdAt)}</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Leaders
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {(candidate.leadersCount ?? candidate.leaders?.length ?? 0)
                          ? `${candidate.leadersCount ?? candidate.leaders?.length ?? 0} linked`
                          : "No leaders yet"}
                      </p>
                    </div>
                  </div>

                  {candidate.isLocked && candidate.lockReason ? (
                    <p className="mt-2 line-clamp-2 text-xs text-rose-700">{candidate.lockReason}</p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col gap-2 xl:min-w-[250px] xl:items-end">
                  <ChevronDown className="hidden size-4 text-muted-foreground xl:block" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleLock({ ...candidate, role: "Candidate" });
                    }}
                    disabled={lockingId === candidate.id}
                    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto ${candidate.isLocked ? "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100" : "border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100"}`}
                  >
                    {lockingId === candidate.id ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : candidate.isLocked ? (
                      <Unlock className="size-4" />
                    ) : (
                      <Lock className="size-4" />
                    )}
                    {candidate.isLocked ? "Unlock" : "Lock"}
                  </button>
                  <Link
                    href={getAdminCandidateLeadersRoute(candidate.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-sm font-medium text-white transition hover:bg-orange-600 xl:w-auto"
                  >
                    See all leaders
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground">
            No candidates match the selected filters.
          </div>
        )}
      </div>

      <PaginationControls pagination={pagination} onPageChange={onPageChange} />
    </section>
  );
}
