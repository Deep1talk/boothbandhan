"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { AlertCircle, ClipboardList, Download, LoaderCircle } from "lucide-react";
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

export default function AdminLeaderProblemsPanel({ leaderId, leaderName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  const issueLabelMap = useMemo(
    () =>
      HELP_DESK_ISSUE_OPTIONS.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {}),
    []
  );

  const handleToggle = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (!nextOpen || hasLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/help-desk/leaders/${leaderId}/problems`);
      setProblems(data.data?.problems ?? []);
      setHasLoaded(true);
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to load leader problems."
      );
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900">
            Help Desk
          </p>
          <p className="mt-1 text-sm text-emerald-950">
            Admin-only problem entries for {leaderName}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={`/api/help-desk/leaders/${leaderId}/problems/export`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
          >
            <Download className="size-4" />
            Download CSV
          </a>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ClipboardList className="size-4" />
            )}
            {isOpen ? "Hide Problems" : "Show Problems"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3">
          {problems.length ? (
            problems.map((problem) => (
              <article
                key={problem.id}
                className="rounded-2xl border border-emerald-200/80 bg-white/95 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-950">
                        {problem.headOfFamilyName}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusPillClass(
                          problem.status
                        )}`}
                      >
                        {problem.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {problem.mobileNumber}
                      {problem.localAddress ? ` • ${problem.localAddress}` : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {problem.issueCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900"
                        >
                          {issueLabelMap[category] || category}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-foreground/90">
                      {problem.issueDetails}
                    </p>

                    {problem.verifierComment ? (
                      <div className="mt-3 rounded-xl border border-border/60 bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                          Verifier comment
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground/90">
                          {problem.verifierComment}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="text-sm text-muted-foreground lg:min-w-[190px] lg:text-right">
                    <p>{formatDate(problem.createdAt)}</p>
                    <p className="mt-2">
                      {[problem.wardNumber, problem.panchayat, problem.block]
                        .filter(Boolean)
                        .join(" • ") || "Area details not added"}
                    </p>
                    {typeof problem.wantsToJoinOrganization === "boolean" ? (
                      <p className="mt-2">
                        Wants to join: {problem.wantsToJoinOrganization ? "Yes" : "No"}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-emerald-200 bg-white/90 p-4 text-sm text-muted-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              No problems have been submitted by this leader yet.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
