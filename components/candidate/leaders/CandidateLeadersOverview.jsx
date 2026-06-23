"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CandidateLeadersOverview({ counts }) {
  const [isMonthlyAttendanceOpen, setIsMonthlyAttendanceOpen] = useState(false);

  return (
    <section
      id="candidate-leaders-overview"
      className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Overview
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
          Leader summary
        </h2>
      </div>

      <div className="mt-5 sm:mt-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <article className="rounded-2xl border border-border/60 bg-sky-50/70 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Leaders in your branch
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              {counts?.leaders ?? 0}
            </p>
          </article>

          <article className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
              Paid leaders
            </p>
            <p className="mt-3 text-2xl font-semibold text-emerald-950 sm:text-3xl">
              {counts?.paidLeaders ?? 0}
            </p>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
              Unpaid leaders
            </p>
            <p className="mt-3 text-2xl font-semibold text-amber-950 sm:text-3xl">
              {(counts?.unpaidLeaders ?? 0) + (counts?.pendingLeaders ?? 0)}
            </p>
          </article>

          <article className={`rounded-2xl border p-4 sm:p-5 ${counts?.isPresentToday ? "border-emerald-200 bg-emerald-50/80" : "border-rose-200 bg-rose-50/80"}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${counts?.isPresentToday ? "text-emerald-800" : "text-rose-800"}`}>
              Attendance today
            </p>
            <p className={`mt-3 text-2xl font-semibold ${counts?.isPresentToday ? "text-emerald-950" : "text-rose-950"} sm:text-3xl`}>
              {counts?.isPresentToday ? "Present" : "Absent"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {counts?.todayRegistrations ?? 0}/{counts?.attendanceRegistrationTarget ?? 12} registrations,{" "}
              {counts?.todayPaidRegistrations ?? 0}/{counts?.attendancePaidTarget ?? 6} paid
            </p>
          </article>

          <article className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-800">
              Attendance days
            </p>
            <p className="mt-3 text-2xl font-semibold text-violet-950 sm:text-3xl">
              {counts?.attendanceDays ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Days meeting 12 registrations with minimum 6 paid.
            </p>
          </article>

          <article className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-800">
              Current month
            </p>
            <p className="mt-3 text-2xl font-semibold text-indigo-950 sm:text-3xl">
              {counts?.currentMonthAttendance ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attendance days in this month.
            </p>
          </article>
        </div>

        <section className="mt-4 rounded-2xl border border-border/60 bg-slate-50/70 p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setIsMonthlyAttendanceOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Monthly attendance
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                Current and previous months
              </h3>
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
              {counts?.monthlyAttendance?.length ? (
                counts.monthlyAttendance.map((month) => (
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
      </div>
    </section>
  );
}
