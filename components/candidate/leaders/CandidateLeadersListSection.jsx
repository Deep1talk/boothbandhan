"use client";

import { useState } from "react";
import {
  CircleDollarSign,
  LoaderCircle,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
  UsersRound,
} from "lucide-react";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import {
  confirmLeaderRegistrationPayment,
  confirmLeaderCashPayment,
  createLeaderRegistrationPaymentOrder,
} from "@/lib/client/usersClient";
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
    .join(" | ");
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

function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CandidateLeadersListSection({
  leaders,
  pagination,
  exportHref,
  isLoading,
  isRefreshing,
  filters,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onRefresh,
}) {
  const [payingLeaderId, setPayingLeaderId] = useState("");
  const [paymentLeader, setPaymentLeader] = useState(null);

  const handleOnlinePayment = async (leader) => {
    try {
      setPayingLeaderId(leader.id);
      setPaymentLeader(null);
      const isLoaded = await loadRazorpayCheckout();

      if (!isLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const orderData = await createLeaderRegistrationPaymentOrder(leader.id);
      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Booth Bandhan",
        description: "Leader registration fee",
        order_id: orderData.order.id,
        prefill: {
          name: orderData.leader.name,
          email: orderData.leader.email,
          contact: orderData.leader.phone,
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (paymentResult) => {
          try {
            await confirmLeaderRegistrationPayment(leader.id, paymentResult);
            toastAlert("success", "Leader payment completed successfully.");
            await onRefresh?.();
          } catch (error) {
            toastAlert(
              "error",
              error.response?.data?.message || error.message || "Payment verification failed."
            );
          } finally {
            setPayingLeaderId("");
          }
        },
        modal: {
          ondismiss: () => {
            setPayingLeaderId("");
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setPayingLeaderId("");
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to start payment."
      );
    }
  };

  const handleCashPayment = async (leader) => {
    try {
      setPayingLeaderId(leader.id);
      const response = await confirmLeaderCashPayment(leader.id);
      toastAlert(
        "success",
        response.message || "Cash payment recorded successfully."
      );
      setPaymentLeader(null);
      await onRefresh?.();
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Unable to record cash payment."
      );
    } finally {
      setPayingLeaderId("");
    }
  };

  return (
    <section
      id="leader-list"
      className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Leader list
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
            Your leaders
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
        title="Leader filters"
        filters={filters}
        onChange={onFilterChange}
        onClear={onClearFilters}
        resultCount={pagination?.itemCount ?? leaders?.length ?? 0}
        totalCount={pagination?.totalItems ?? leaders?.length ?? 0}
        searchPlaceholder="Name | Phone | Id No | Block"
      />

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Loading leaders...
            </div>
          </div>
        ) : leaders.length ? (
          leaders.map((leader) => (
            <article
              key={leader.id}
              className="rounded-[1.15rem] border border-border/60 bg-background/75 p-4 sm:rounded-[1.25rem] sm:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-sky-500 p-2.5 text-white shadow-lg">
                      <UsersRound className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-950">
                          Leader
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-muted-foreground">
                          <ShieldCheck className="size-3.5" />
                          {leader.isEmailVerified ? "Verified" : "Pending"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            leader.isLocked
                              ? "bg-rose-100 text-rose-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {leader.isLocked ? (
                            <Lock className="size-3.5" />
                          ) : (
                            <Unlock className="size-3.5" />
                          )}
                          {leader.isLocked ? "Locked" : "Active"}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${paymentPillClass(
                            leader.registrationPaymentStatus
                          )}`}
                        >
                          {leader.registrationPaymentStatus || "pending"}
                        </span>
                      </div>

                      <h3 className="mt-3 break-words text-base font-semibold text-foreground">
                        {leader.name}
                      </h3>
                      <p className="break-all text-sm text-muted-foreground">
                        {leader.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_minmax(140px,0.8fr)] xl:items-center">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Political details
                      </p>
                      <p className="mt-1 text-sm text-foreground">{leader.phone}</p>
                      {leader.currentParty || leader.politicalPosition ? (
                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          {[leader.currentParty, leader.politicalPosition]
                            .filter(Boolean)
                            .join(" | ")}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          No party or position added.
                        </p>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Coverage
                      </p>
                      <p className="mt-1 break-words text-sm text-foreground">
                        {leader.vidhansabha || "Not set"}
                      </p>
                      <p className="break-words text-xs text-muted-foreground">
                        {buildAreaLine(leader) || leader.phone}
                      </p>
                    </div>

                    <div className="sm:col-span-2 xl:col-span-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Strength
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {leader.activeWorkerCount ?? 0} workers
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {leader.totalVoters ?? 0} voters | {formatDate(leader.createdAt)}
                      </p>
                    </div>
                  </div>

                  {leader.isLocked && leader.lockReason ? (
                    <p className="mt-2 line-clamp-2 text-xs text-rose-700">
                      {leader.lockReason}
                    </p>
                  ) : null}
                </div>

                <div className="xl:min-w-[140px] xl:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Status
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      leader.isLocked ? "text-rose-700" : "text-emerald-700"
                    }`}
                  >
                    {leader.isLocked ? "Locked" : "Active"}
                  </p>
                  {leader.registrationPaymentStatus === "paid" ? (
                    <span className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-900 xl:w-auto">
                      Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPaymentLeader(leader)}
                      disabled={payingLeaderId === leader.id}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
                    >
                      {payingLeaderId === leader.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <CircleDollarSign className="size-4" />
                      )}
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground">
            No leaders match the selected filters.
          </div>
        )}
      </div>

      <PaginationControls pagination={pagination} onPageChange={onPageChange} />

      {paymentLeader ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-md rounded-[1.5rem] border border-border/60 bg-white p-6 shadow-[0_20px_80px_rgba(15,23,42,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Complete payment
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Choose payment method
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Select how you want to complete payment for{" "}
              <span className="font-semibold text-foreground">
                {paymentLeader.name}
              </span>
              .
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => handleOnlinePayment(paymentLeader)}
                disabled={payingLeaderId === paymentLeader.id}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payingLeaderId === paymentLeader.id
                  ? "Starting payment..."
                  : "Online Payment"}
              </button>
              <button
                type="button"
                onClick={() => handleCashPayment(paymentLeader)}
                disabled={payingLeaderId === paymentLeader.id}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payingLeaderId === paymentLeader.id
                  ? "Processing..."
                  : "Cash Payment"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!payingLeaderId) {
                  setPaymentLeader(null);
                }
              }}
              disabled={Boolean(payingLeaderId)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
