"use client";

import { useState } from "react";
import {
  CircleDollarSign,
  LoaderCircle,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unlock,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import AdminLeaderProblemsPanel from "@/components/admin/leaders/AdminLeaderProblemsPanel";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { useRemoteData } from "@/hooks/useRemoteData";
import {
  confirmLeaderCashPayment,
  confirmLeaderRegistrationPayment,
  createLeaderRegistrationPaymentOrder,
  deleteManagedUser,
  getLeaders,
  resendManagedUserVerificationEmail,
  toggleManagedUserLock,
} from "@/lib/client/usersClient";
import {
  buildManagedUserFilterQueryParams,
  createManagedUserFilters,
  MANAGED_USER_PAGE_SIZE,
} from "@/lib/managedUserFilters";
import { showConfirmAlert } from "@/lib/sweetAlert";
import { toastAlert } from "@/lib/toastAlert";

const ADMIN_LEADER_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Verified", label: "Verified" },
  { value: "Locked", label: "Locked" },
  { value: "Paid", label: "Paid" },
  { value: "Unpaid", label: "Unpaid" },
  { value: "Pending", label: "Pending" },
];

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

function getManagedByLabel(leader) {
  if (leader.leaderSource === "direct") {
    return "Direct registration";
  }

  return leader.parentName || "Field associate";
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

export default function AdminLeadersPageSection() {
  const [deletingId, setDeletingId] = useState("");
  const [lockingId, setLockingId] = useState("");
  const [payingLeaderId, setPayingLeaderId] = useState("");
  const [paymentLeader, setPaymentLeader] = useState(null);
  const [resendingLeaderId, setResendingLeaderId] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getLeaders({
        page,
        pageSize: MANAGED_USER_PAGE_SIZE,
        filters,
      }),
    {
      initialData: {
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
          directLeaders: 0,
          candidateLeaders: 0,
        },
      },
      onError: (error) => {
        toastAlert("error", error.response?.data?.message || error.message || "Unable to load leaders.");
      },
      dependencyKey: JSON.stringify({ page, filters }),
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

  const handleDeleteLeader = async (leader) => {
    const result = await showConfirmAlert(
      "Delete leader?",
      `${leader.name} will be permanently deleted.`,
      {
        icon: "warning",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#b91c1c",
      }
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(leader.id);
      const response = await deleteManagedUser(leader.id);
      toastAlert("success", response.message || "Leader deleted successfully.");
      await refresh();
    } catch (error) {
      toastAlert("error", error.response?.data?.message || error.message || "Unable to delete leader.");
    } finally {
      setDeletingId("");
    }
  };

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
            await refresh();
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
      await refresh();
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

  const handleResendVerification = async (leader) => {
    try {
      setResendingLeaderId(leader.id);
      const response = await resendManagedUserVerificationEmail(leader.id);
      toastAlert(
        "success",
        response.message || `Verification email sent to ${leader.email}.`
      );
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Unable to resend verification email."
      );
    } finally {
      setResendingLeaderId("");
    }
  };

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-900">
                All leaders
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
              All leader accounts in one place
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse direct registrations and field-associate-managed leaders together with server-side filters and pagination.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={`/api/users/leaders/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:w-auto"
            >
              Export CSV
            </a>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isRefreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.5rem] border border-border/60 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Total leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{data.counts?.leaders ?? 0}</p>
        </article>
        <article className="rounded-[1.5rem] border border-sky-200 bg-sky-50/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-900">
            Direct leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-sky-950">{data.counts?.directLeaders ?? 0}</p>
        </article>
        <article className="rounded-[1.5rem] border border-orange-200 bg-orange-50/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-900">
            Field associate leaders
          </p>
          <p className="mt-3 text-3xl font-semibold text-orange-950">{data.counts?.candidateLeaders ?? 0}</p>
        </article>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">Leaders</h3>
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-900">
            {data.counts?.leaders ?? 0} total
          </span>
        </div>

        <ManagedUserFilters
          title="Leader filters"
          filters={filters}
          showBloodGroup={false}
          showLeaderManagementFilters
          statusOptions={ADMIN_LEADER_STATUS_OPTIONS}
          onChange={handleFilterChange}
          onClear={() => {
            setPage(1);
            setFilters(createManagedUserFilters());
          }}
          resultCount={data.pagination?.itemCount ?? data.leaders?.length ?? 0}
          totalCount={data.pagination?.totalItems ?? data.leaders?.length ?? 0}
          searchPlaceholder="Name | Phone | Block | Field Associate"
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
                      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-900">
                        Leader
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          leader.leaderSource === "direct"
                            ? "bg-sky-100 text-sky-900"
                            : "bg-violet-100 text-violet-900"
                        }`}
                      >
                        {leader.leaderSource === "direct" ? "Direct" : "Field Associate"}
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

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1.1fr)_minmax(200px,1fr)_minmax(180px,0.9fr)_minmax(140px,0.8fr)] xl:items-center">
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
                          Managed by
                        </p>
                        <p className="mt-1 text-sm text-foreground">{getManagedByLabel(leader)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {leader.leaderSource === "direct"
                            ? "Registered without a parent field associate"
                            : "Connected under a field associate account"}
                        </p>
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
                        <p className="text-xs text-muted-foreground">{leader.totalVoters ?? 0} voters</p>
                      </div>
                    </div>

                    {leader.isLocked && leader.lockReason ? (
                      <p className="mt-2 line-clamp-2 text-xs text-rose-700">{leader.lockReason}</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 xl:min-w-[170px] xl:items-end">
                    <div className="rounded-2xl bg-orange-500 p-2.5 text-white shadow-lg">
                      {leader.leaderSource === "direct" ? (
                        <UsersRound className="size-4.5" />
                      ) : (
                        <UserRoundSearch className="size-4.5" />
                      )}
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
                    <button
                      type="button"
                      onClick={() => handleDeleteLeader(leader)}
                      disabled={deletingId === leader.id}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-900 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
                    >
                      {deletingId === leader.id ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      {deletingId === leader.id ? "Deleting..." : "Delete"}
                    </button>
                    {!leader.isEmailVerified ? (
                      <button
                        type="button"
                        onClick={() => handleResendVerification(leader)}
                        disabled={resendingLeaderId === leader.id}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-medium text-sky-900 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
                      >
                        {resendingLeaderId === leader.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : null}
                        {resendingLeaderId === leader.id ? "Sending..." : "Resend email"}
                      </button>
                    ) : null}
                    {leader.registrationPaymentStatus === "paid" ? (
                      <span className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-900 xl:w-auto">
                        Paid
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPaymentLeader(leader)}
                        disabled={payingLeaderId === leader.id}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto"
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

                <AdminLeaderProblemsPanel leaderId={leader.id} leaderName={leader.name} />
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
