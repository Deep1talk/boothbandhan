"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ChevronDown, Download, ImagePlus, LoaderCircle, Lock, RefreshCw, ShieldCheck, Unlock, UsersRound, X } from "lucide-react";
import ManagedUserFilters from "@/components/shared/filters/ManagedUserFilters";
import AdminLeaderProblemsPanel from "@/components/admin/leaders/AdminLeaderProblemsPanel";
import PaginationControls from "@/components/shared/filters/PaginationControls";
import { ADMIN_CANDIDATES } from "@/routes/adminpanelRoutes";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getCandidateLeaders, toggleManagedUserLock } from "@/lib/client/usersClient";
import { BIHAR_DISTRICTS, BLOOD_GROUP_OPTIONS, getVidhansabhaOptions } from "@/lib/leaderRegistration";
import {
  buildManagedUserFilterQueryParams,
  createManagedUserFilters,
  MANAGED_USER_PAGE_SIZE,
} from "@/lib/managedUserFilters";
import { toastAlert } from "@/lib/toastAlert";
import { zodAdminUpdateManagedUserSchema } from "@/lib/zodSchema";

const ADMIN_LEADER_STATUS_OPTIONS = [
  { value: "Locked", label: "Locked" },
  { value: "Paid", label: "Paid" },
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

function buildCandidateInfoRows(candidate) {
  if (!candidate) {
    return [];
  }

  return [
    { label: "ID No.", value: candidate.idNo || "Not added" },
    { label: "Blood Group", value: candidate.bloodGroup || "Not added" },
    { label: "Phone", value: candidate.phone || "Not added" },
    { label: "Email", value: candidate.email || "Not added" },
    { label: "Full Address", value: candidate.fullAddress || "Not added" },
    { label: "Block", value: candidate.block || "Not added" },
    { label: "District", value: candidate.district || "Not added" },
    { label: "Assembly", value: candidate.vidhansabha || "Not added" },
    { label: "Created", value: candidate.createdAt ? formatDate(candidate.createdAt) : "Not added" },
    { label: "Status", value: candidate.isLocked ? "Locked" : "Active" },
    { label: "Email Verify", value: candidate.isEmailVerified ? "Verified" : "Pending" },
  ];
}

const ID_CARD_SIZE = {
  width: 638,
  height: 1011,
};

const ID_CARD_SIGN_SRC = "/assests/id-card/authorized-sign.png";
const ID_CARD_LOGO_SRC = "/assests/images/logo.webp";
const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

function loadCardImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

async function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to create ID card image."));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

function wrapCanvasText(ctx, text, maxWidth) {
  if (!text) {
    return [];
  }

  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = words.shift() || "";

  words.forEach((word) => {
    const nextLine = `${currentLine} ${word}`.trim();

    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export default function AdminCandidateLeadersPageSection({ candidateId }) {
  const [lockingId, setLockingId] = useState("");
  const [isMonthlyAttendanceOpen, setIsMonthlyAttendanceOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(createManagedUserFilters());
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const [isDownloadingIdCard, setIsDownloadingIdCard] = useState(false);
  const [idCardError, setIdCardError] = useState("");
  const idCardCanvasRef = useRef(null);
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(
    () =>
      getCandidateLeaders(candidateId, {
        page,
        pageSize: MANAGED_USER_PAGE_SIZE,
        filters,
      }),
    {
      initialData: {
        candidate: null,
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
          paidLeaders: 0,
          unpaidLeaders: 0,
          pendingLeaders: 0,
          attendanceDays: 0,
          todayRegistrations: 0,
          todayPaidRegistrations: 0,
          isPresentToday: false,
          currentMonthAttendance: 0,
          monthlyAttendance: [],
          attendanceRegistrationTarget: 12,
          attendancePaidTarget: 6,
        },
      },
      onError: (error) => {
        toastAlert("error", error.response?.data?.message || error.message || "Unable to load leaders.");
      },
      dependencyKey: JSON.stringify({ candidateId, page, filters }),
    }
  );
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodAdminUpdateManagedUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      idNo: "",
      bloodGroup: "",
      fullAddress: "",
      block: "",
      district: "",
      vidhansabha: "",
    },
  });
  const selectedDistrict = useWatch({ control, name: "district" });
  const selectedVidhansabha = useWatch({ control, name: "vidhansabha" });
  const vidhansabhaOptions = useMemo(
    () => getVidhansabhaOptions(selectedDistrict),
    [selectedDistrict]
  );
  const profileImagePreviewUrl = useMemo(
    () => (profileImageFile ? URL.createObjectURL(profileImageFile) : ""),
    [profileImageFile]
  );

  useEffect(() => {
    if (data.candidate) {
      reset({
        name: data.candidate.name || "",
        email: data.candidate.email || "",
        phone: data.candidate.phone || "",
        idNo: data.candidate.idNo || "",
        bloodGroup: data.candidate.bloodGroup || "",
        fullAddress: data.candidate.fullAddress || "",
        block: data.candidate.block || "",
        district: data.candidate.district || "",
        vidhansabha: data.candidate.vidhansabha || "",
      });
    }
  }, [data.candidate, reset]);

  useEffect(() => {
    if (!selectedDistrict) {
      return;
    }

    if (selectedVidhansabha && !vidhansabhaOptions.includes(selectedVidhansabha)) {
      setValue("vidhansabha", "");
    }
  }, [selectedDistrict, selectedVidhansabha, setValue, vidhansabhaOptions]);

  useEffect(() => {
    return () => {
      if (profileImagePreviewUrl) {
        URL.revokeObjectURL(profileImagePreviewUrl);
      }
    };
  }, [profileImagePreviewUrl]);

  useEffect(() => {
    let isMounted = true;

    async function renderIdCard() {
      const candidate = data.candidate;
      const canvas = idCardCanvasRef.current;

      if (!candidate || !canvas) {
        return;
      }

      setIdCardError("");

      try {
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas preview is not available in this browser.");
        }

        const [logoImage, signImage, profileImage] = await Promise.all([
          loadCardImage(ID_CARD_LOGO_SRC),
          loadCardImage(ID_CARD_SIGN_SRC),
          loadCardImage(candidate.avatar || DEFAULT_AVATAR),
        ]);

        if (!isMounted) {
          return;
        }

        canvas.width = ID_CARD_SIZE.width;
        canvas.height = ID_CARD_SIZE.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#4f98c7";
        ctx.fillRect(canvas.width - 118, 0, 118, canvas.height * 0.53);
        ctx.fillStyle = "#e02424";
        ctx.fillRect(canvas.width - 118, canvas.height * 0.53, 118, canvas.height * 0.47);

        ctx.save();
        ctx.translate(canvas.width - 59, 245);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 42px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Field", 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(canvas.width - 59, 765);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 44px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Associate", 0, 0);
        ctx.restore();

        if (logoImage) {
          ctx.drawImage(logoImage, 28, 34, 130, 88);
        }

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "700 28px Arial, sans-serif";
        ctx.fillStyle = "#1e5aa7";
        ctx.fillText("Booth", 170, 42);
        ctx.fillStyle = "#d42d2d";
        ctx.fillText("Bandhan", 268, 42);
        ctx.fillStyle = "#1e5aa7";
        ctx.fillText("Pvt. Ltd.", 170, 78);

        ctx.lineWidth = 6;
        ctx.strokeStyle = "#50505d";
        ctx.strokeRect(92, 170, 286, 344);

        if (profileImage) {
          ctx.drawImage(profileImage, 98, 176, 274, 332);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#0f172a";
        ctx.font = "700 32px Arial, sans-serif";
        ctx.fillText(candidate.name || "Field Associate", 235, 540, 360);

        const infoRows = [
          ["ID No", candidate.idNo || "-"],
          ["Blood Group", candidate.bloodGroup || "-"],
          ["Contact", candidate.phone || "-"],
          ["Assembly", candidate.vidhansabha || "-"],
          ["District", candidate.district || "-"],
          ["Block", candidate.block || "-"],
        ];

        ctx.textAlign = "left";
        ctx.fillStyle = "#111827";
        ctx.font = "700 17px Arial, sans-serif";

        infoRows.forEach(([label, value], index) => {
          const y = 638 + index * 31;
          ctx.fillText(label, 48, y);
          ctx.font = "600 17px Arial, sans-serif";
          ctx.fillText(`: ${value}`, 160, y);
          ctx.font = "700 17px Arial, sans-serif";
        });

        if (signImage) {
          ctx.drawImage(signImage, 360, 860, 118, 36);
        }

        ctx.textAlign = "right";
        ctx.font = "700 13px Arial, sans-serif";
        ctx.fillText("Authorised Signatory", 490, 904);

        const addressLines = wrapCanvasText(
          ctx,
          candidate.fullAddress || "Address not added",
          295
        ).slice(0, 3);

        ctx.fillStyle = "#e02424";
        ctx.fillRect(0, canvas.height - 58, 57, 58);
        ctx.fillRect(57, canvas.height - 84, 28, 26);

        ctx.textAlign = "left";
        ctx.font = "700 12px Arial, sans-serif";
        ctx.fillStyle = "#111827";
        ctx.fillText("Address:", 95, 962);
        ctx.font = "600 12px Arial, sans-serif";
        addressLines.forEach((line, index) => {
          ctx.fillText(line, 160, 962 + index * 17, 300);
        });
      } catch (error) {
        if (isMounted) {
          setIdCardError(error.message || "Unable to render ID card preview.");
        }
      }
    }

    renderIdCard();

    return () => {
      isMounted = false;
    };
  }, [data.candidate]);

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

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setProfileImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      toastAlert("error", "Invalid image", "Please choose an image file for the profile picture.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      toastAlert("error", "Image too large", "Profile picture must be 2MB or smaller.");
      return;
    }

    setProfileImageFile(file);
  };

  const clearSelectedProfileImage = () => {
    setProfileImageFile(null);
    setProfileImageInputKey((current) => current + 1);
  };

  const handleManagedUserUpdate = async (formValues) => {
    try {
      const formData = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const { data: response } = await axios.put(`/api/users/${candidateId}`, formData);

      if (!response.success) {
        throw new Error(response.message);
      }

      toastAlert("success", "Field associate updated", response.message || "Field associate updated successfully.");
      clearSelectedProfileImage();
      setIsEditOpen(false);
      await refresh();
    } catch (error) {
      toastAlert(
        "error",
        "Unable to update field associate",
        error.response?.data?.message || error.message || "Please try again."
      );
    }
  };

  const handleDownloadIdCard = async () => {
    try {
      const canvas = idCardCanvasRef.current;

      if (!canvas || !data.candidate) {
        throw new Error("ID card preview is not ready yet.");
      }

      setIsDownloadingIdCard(true);
      const blob = await canvasToBlob(canvas, "image/png");
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = `${(data.candidate.name || "field-associate").replace(/\s+/g, "-").toLowerCase()}-id-card.png`;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      toastAlert("error", "Unable to download ID card", error.message || "Please try again.");
    } finally {
      setIsDownloadingIdCard(false);
    }
  };

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={ADMIN_CANDIDATES}
                className="inline-flex rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Back
              </Link>
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-900">
                Field associate overview
              </span>
              {data.candidate?.isLocked ? (
                <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-900">
                  Field associate locked
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
              {data.candidate?.name || "Loading field associate"}
            </h2>
            {data.candidate ? (
              <div className="mt-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  {data.candidate.email} | {data.candidate.phone}
                </p>
                {data.candidate.isLocked && data.candidate.lockReason ? (
                  <p className="text-sm text-rose-700">{data.candidate.lockReason}</p>
                ) : null}
              </div>
            ) : null}
          </div>

        </div>
      </section>

      {data.candidate ? (
        <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="flex flex-col gap-5 xl:flex-row">
            <article className="overflow-hidden rounded-[1.5rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 xl:w-[360px]">
              <div className="border-b border-orange-100 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                  Field associate ID card
                </p>
                <p className="mt-2 text-sm text-slate-600">Preview and download</p>
              </div>
              <div className="p-5">
                <div className="rounded-[1.4rem] border border-orange-200 bg-white/90 p-3 shadow-sm">
                  <canvas
                    ref={idCardCanvasRef}
                    width={ID_CARD_SIZE.width}
                    height={ID_CARD_SIZE.height}
                    className="h-auto w-full rounded-[1rem] border border-orange-100 bg-white"
                  />
                </div>
                {idCardError ? (
                  <p className="mt-3 text-sm text-destructive">{idCardError}</p>
                ) : null}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadIdCard}
                    disabled={isDownloadingIdCard}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDownloadingIdCard ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    {isDownloadingIdCard ? "Preparing..." : "Download ID Card"}
                  </button>
                </div>
              </div>
            </article>

            <article className="min-w-0 flex-1 rounded-[1.5rem] border border-border/60 bg-slate-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Full information
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                All field associate details
              </h3>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {buildCandidateInfoRows(data.candidate).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border/60 bg-white px-4 py-3 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {data.candidate ? (
        <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Manage
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">Edit field associate</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditOpen((prev) => !prev)}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {isEditOpen ? "Close editor" : "Edit information"}
            </button>
          </div>

          {isEditOpen ? (
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(handleManagedUserUpdate)} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  {...register("name")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input
                  {...register("phone")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ID No.</label>
                <input
                  {...register("idNo")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                {errors.idNo ? <p className="text-sm text-destructive">{errors.idNo.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Group</label>
                <select
                  {...register("bloodGroup")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup ? <p className="text-sm text-destructive">{errors.bloodGroup.message}</p> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Full Address</label>
                <input
                  {...register("fullAddress")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                {errors.fullAddress ? <p className="text-sm text-destructive">{errors.fullAddress.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Block</label>
                <input
                  {...register("block")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                {errors.block ? <p className="text-sm text-destructive">{errors.block.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <select
                  {...register("district")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                >
                  <option value="">Select district</option>
                  {BIHAR_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {errors.district ? <p className="text-sm text-destructive">{errors.district.message}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assembly Constituency</label>
                <select
                  {...register("vidhansabha")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                >
                  <option value="">{selectedDistrict ? "Select vidhansabha" : "Select district first"}</option>
                  {vidhansabhaOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.vidhansabha ? <p className="text-sm text-destructive">{errors.vidhansabha.message}</p> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="rounded-[1.4rem] border border-orange-200 bg-white/90 p-4">
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.2rem] border border-dashed border-orange-300 bg-orange-50/60 px-4 py-6 text-center transition hover:bg-orange-100/70">
                    <ImagePlus className="size-7 text-orange-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Choose profile picture</p>
                      <p className="mt-1 text-xs text-slate-600">JPG, PNG, or WEBP up to 2MB.</p>
                    </div>
                    <input
                      key={profileImageInputKey}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {profileImageFile ? (
                  <div className="overflow-hidden rounded-[1.25rem] border border-orange-200 bg-white shadow-sm">
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Image
                        src={profileImagePreviewUrl}
                        alt="Profile preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div>
                        <p className="truncate text-sm font-medium text-slate-900">{profileImageFile.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{Math.max(1, Math.round(profileImageFile.size / 1024))} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedProfileImage}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent"
                      >
                        <X className="size-4" />
                        Clear
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                  {isSubmitting ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (data.candidate) {
                      reset({
                        name: data.candidate.name || "",
                        email: data.candidate.email || "",
                        phone: data.candidate.phone || "",
                        idNo: data.candidate.idNo || "",
                        bloodGroup: data.candidate.bloodGroup || "",
                        fullAddress: data.candidate.fullAddress || "",
                        block: data.candidate.block || "",
                        district: data.candidate.district || "",
                        vidhansabha: data.candidate.vidhansabha || "",
                      });
                    }
                    clearSelectedProfileImage();
                    setIsEditOpen(false);
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border/60 bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Overview
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Individual field associate summary</h3>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-border/60 bg-orange-50/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Leaders
            </p>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {data.counts?.leaders ?? 0}
            </p>
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
              {data.counts?.todayRegistrations ?? 0}/{data.counts?.attendanceRegistrationTarget ?? 12} registrations,{" "}
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
              Days meeting the registration and paid target.
            </p>
          </article>

          <article className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-800">
              Current month
            </p>
            <p className="mt-3 text-3xl font-semibold text-indigo-950">
              {data.counts?.currentMonthAttendance ?? 0}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attendance days recorded this month.
            </p>
          </article>
        </div>

        <section className="mt-4 rounded-2xl border border-border/60 bg-slate-50/70 p-5">
          <button
            type="button"
            onClick={() => setIsMonthlyAttendanceOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Monthly attendance
              </p>
              <h4 className="mt-1 text-base font-semibold text-foreground">
                Current and previous months
              </h4>
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
              {data.counts?.monthlyAttendance?.length ? (
                data.counts.monthlyAttendance.map((month) => (
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
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-foreground">Leaders</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
              {data.counts?.leaders ?? 0} total
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRefreshing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Refresh
            </button>
            <a
              href={`/api/users/candidates/${candidateId}/leaders/export?${buildManagedUserFilterQueryParams(filters).toString()}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-white px-4 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Export CSV
            </a>
          </div>
        </div>

        <ManagedUserFilters
          title="Leader filters"
          filters={filters}
          showBloodGroup={false}
          statusOptions={ADMIN_LEADER_STATUS_OPTIONS}
          onChange={handleFilterChange}
          onClear={() => {
            setPage(1);
            setFilters(createManagedUserFilters());
          }}
          resultCount={data.pagination?.itemCount ?? data.leaders?.length ?? 0}
          totalCount={data.pagination?.totalItems ?? data.leaders?.length ?? 0}
          searchPlaceholder="Name | Phone | Block"
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
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-900">
                        Leader
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

                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(220px,1.2fr)_minmax(180px,1fr)_minmax(140px,0.8fr)] xl:items-center">
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
                        <p className="text-xs text-muted-foreground">
                          {leader.totalVoters ?? 0} voters • {formatDate(leader.createdAt)}
                        </p>
                      </div>
                    </div>

                    {leader.isLocked && leader.lockReason ? (
                      <p className="mt-2 line-clamp-2 text-xs text-rose-700">{leader.lockReason}</p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 xl:min-w-[170px] xl:items-end">
                    <div className="rounded-2xl bg-orange-500 p-2.5 text-white shadow-lg">
                      <UsersRound className="size-4.5" />
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
                  </div>
                </div>

                <AdminLeaderProblemsPanel
                  leaderId={leader.id}
                  leaderName={leader.name}
                />
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
    </section>
  );
}
