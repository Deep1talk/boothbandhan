export default function AdminCandidatesOverview({ counts }) {
  return (
    <section
      id="admin-candidates-overview"
      className="rounded-[1.75rem] border border-border/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Overview
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          Candidate summary
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-border/60 bg-orange-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Candidates
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {counts?.candidates ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-border/60 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Leaders under candidates
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {counts?.leaders ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-border/60 bg-sky-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Direct leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {counts?.standaloneLeaders ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-border/60 bg-emerald-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Total leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {counts?.totalLeaders ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
            Paid leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-emerald-950">
            {counts?.paidLeaders ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
            Unpaid leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-amber-950">
            {counts?.unpaidLeaders ?? 0}
          </p>
        </article>
      </div>
    </section>
  );
}
