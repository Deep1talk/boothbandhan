"use client";

import { useEffect, useRef, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { toastAlert } from "@/lib/toastAlert";

const ID_CARD_SIZE = {
  width: 638,
  height: 1011,
};

const ID_CARD_SIGN_SRC = "/assests/id-card/authorized-sign.png";
const ID_CARD_LOGO_SRC = "/assests/images/logo.webp";
const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

export default function FieldAssociateIdCardPanel({ user }) {
  const [isDownloadingIdCard, setIsDownloadingIdCard] = useState(false);
  const [idCardError, setIdCardError] = useState("");
  const idCardCanvasRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function renderIdCard() {
      const canvas = idCardCanvasRef.current;

      if (!user || !canvas) {
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
          loadCardImage(user.avatar || DEFAULT_AVATAR),
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
        ctx.fillText("FIELD", 0, 0);
        ctx.restore();

        ctx.save();
        ctx.translate(canvas.width - 59, 765);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 44px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ASSOCIATE", 0, 0);
        ctx.restore();

        if (logoImage) {
          ctx.drawImage(logoImage, 28, 34, 130, 88);
        }

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "700 28px Arial, sans-serif";
        ctx.fillStyle = "#1e5aa7";
        ctx.fillText("Booth", 186, 42);
        ctx.fillStyle = "#d42d2d";
        ctx.fillText("Bandhan", 284, 42);
        ctx.fillStyle = "#1e5aa7";
        ctx.fillText("Pvt. Ltd.", 186, 78);

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
        ctx.fillText(user.name || "Field Associate", 235, 540, 360);

        const infoRows = [
          ["ID No", user.idNo || "-"],
          ["Blood Group", user.bloodGroup || "-"],
          ["Contact", user.phone || "-"],
          ["Assembly", user.vidhansabha || "-"],
          ["District", user.district || "-"],
          ["Block", user.block || "-"],
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

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 10px Arial, sans-serif";
        ctx.fillText("Note: This card is valid from May", canvas.width - 112, 922, 104);
        ctx.fillText("2026 to August 2026.", canvas.width - 112, 936, 104);

        const addressLines = wrapCanvasText(
          ctx,
          user.fullAddress || "Address not added",
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
  }, [user]);

  const handleDownloadIdCard = async () => {
    try {
      const canvas = idCardCanvasRef.current;

      if (!canvas || !user) {
        throw new Error("ID card preview is not ready yet.");
      }

      setIsDownloadingIdCard(true);
      const blob = await canvasToBlob(canvas, "image/png");
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = `${(user.name || "field-associate").replace(/\s+/g, "-").toLowerCase()}-id-card.png`;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      toastAlert("error", "Unable to download ID card", error.message || "Please try again.");
    } finally {
      setIsDownloadingIdCard(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
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
            {buildCandidateInfoRows(user).map((item) => (
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
  );
}
