import Link from "next/link";
import { Bell, ImageIcon, Images } from "lucide-react";
import {
  ADMIN_ANNOUNCEMENTS,
  ADMIN_GALLERY,
  ADMIN_GREETING_TEMPLATES,
} from "@/routes/adminpanelRoutes";

export default function AdminCandidatesOverview({ counts }) {
  return (
    <section
      id="admin-candidates-overview"
      className="rounded-[1.75rem] border border-border/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    >
      <div className="mb-4 grid gap-3 md:hidden">
        <Link
          href={ADMIN_GREETING_TEMPLATES}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.35rem] border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
        >
          <ImageIcon className="size-4" />
          Greeting Templates
        </Link>
        <Link
          href={ADMIN_GALLERY}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.35rem] border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 transition hover:bg-sky-100"
        >
          <Images className="size-4" />
          Gallery
        </Link>
        <Link
          href={ADMIN_ANNOUNCEMENTS}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[1.35rem] border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-900 transition hover:bg-orange-100"
        >
          <Bell className="size-4" />
          Announcements
        </Link>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Overview
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          Field associate summary
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-border/60 bg-orange-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Field associates
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {counts?.candidates ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-border/60 bg-amber-50/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Leaders under field associates
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
