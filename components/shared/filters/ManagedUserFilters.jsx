"use client";

import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { BIHAR_DISTRICTS, getVidhansabhaOptions } from "@/lib/leaderRegistration";

export default function ManagedUserFilters({
  title = "Filters",
  searchPlaceholder = "Name | Phone | Block",
  filters,
  onChange,
  onClear,
  resultCount,
  totalCount,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const preventManualDateEntry = (event) => {
    event.preventDefault();
  };
  const vidhansabhaOptions = filters.district
    ? getVidhansabhaOptions(filters.district)
    : Array.from(
        new Set(BIHAR_DISTRICTS.flatMap((district) => getVidhansabhaOptions(district)))
      );

  return (
    <section className="mt-5 rounded-[1.25rem] border border-border/60 bg-slate-50/80 p-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-white text-foreground shadow-sm">
            <SlidersHorizontal className="size-4" />
          </div>
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {resultCount} of {totalCount}
          </p>
          </div>
        </div>
        <ChevronDown
          className={`size-5 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="mt-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <X className="size-4" />
              Clear filters
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(260px,1.2fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)]">
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">Date range</span>
              <div className="grid gap-2 rounded-lg border border-border bg-background p-2 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Start date</span>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(event) => onChange("startDate", event.target.value)}
                    onKeyDown={preventManualDateEntry}
                    onPaste={preventManualDateEntry}
                    className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">End date</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(event) => onChange("endDate", event.target.value)}
                    onKeyDown={preventManualDateEntry}
                    onPaste={preventManualDateEntry}
                    className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                  />
                </label>
              </div>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">District</span>
              <select
                value={filters.district}
                onChange={(event) => onChange("district", event.target.value)}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              >
                <option value="">All districts</option>
                {BIHAR_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Vidhansabha</span>
              <select
                value={filters.vidhansabha}
                onChange={(event) => onChange("vidhansabha", event.target.value)}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              >
                <option value="">All vidhansabhas</option>
                {vidhansabhaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => onChange("search", event.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
              </div>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
