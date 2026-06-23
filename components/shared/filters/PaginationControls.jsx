"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function buildVisiblePages(currentPage, totalPages) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export default function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  const visiblePages = buildVisiblePages(pagination.page, pagination.totalPages);

  return (
    <section className="mt-6 rounded-[1.25rem] border border-border/60 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Pagination
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 max-sm:justify-between">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPreviousPage}
            className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>

          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`inline-flex size-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                page === pagination.page
                  ? "bg-foreground text-background shadow-sm"
                  : "border border-border/60 bg-background text-foreground hover:bg-muted"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
