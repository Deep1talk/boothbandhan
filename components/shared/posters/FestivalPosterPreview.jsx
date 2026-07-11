"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, LoaderCircle, Share2 } from "lucide-react";
import {
  DEFAULT_POSTER_CARD_COLOR,
  DEFAULT_POSTER_STRIP_COLOR,
  DEFAULT_POSTER_FONT,
  DEFAULT_POSTER_LOGO,
  DEFAULT_POSTER_SIZE,
  DEFAULT_POSTER_CONTACT_COLOR,
  DEFAULT_POSTER_NAME_COLOR,
  DEFAULT_POSTER_TAGLINE_COLOR,
} from "@/lib/posters";

const DEFAULT_AVATAR =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();

    if (/^https?:/i.test(src)) {
      image.crossOrigin = "anonymous";
    }

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function roundRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCoverImage(ctx, image, dx, dy, dw, dh, options = {}) {
  if (!image) {
    return;
  }

  const imageWidth = image.width || 1;
  const imageHeight = image.height || 1;
  const scale = Math.max(dw / imageWidth, dh / imageHeight) * (options.scale || 1);
  const sw = imageWidth * scale;
  const sh = imageHeight * scale;
  const x = dx + (dw - sw) / 2 + (options.offsetX || 0);
  const y = dy + (dh - sh) / 2 + (options.offsetY || 0);

  ctx.drawImage(image, x, y, sw, sh);
}

function drawContactIcon(ctx, type, centerX, centerY, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.translate(centerX, centerY);
  ctx.scale(1.28, 1.28);
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (type === "phone") {
    ctx.beginPath();
    ctx.moveTo(-7, -3);
    ctx.quadraticCurveTo(-3, -10, 2, -6);
    ctx.moveTo(-2, 6);
    ctx.quadraticCurveTo(3, 10, 7, 3);
    ctx.moveTo(-5, -1);
    ctx.quadraticCurveTo(-1, 4, 4, 6);
    ctx.stroke();
  } else if (type === "whatsapp") {
    ctx.beginPath();
    ctx.arc(0, -0.5, 9.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4.8, 6.8);
    ctx.lineTo(1.5, 5.2);
    ctx.lineTo(2.6, 9.6);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-4.2, -1.6);
    ctx.quadraticCurveTo(-1.5, -5.8, 2.2, -3.3);
    ctx.moveTo(-0.8, 4);
    ctx.quadraticCurveTo(2.4, 5.8, 4.6, 2.2);
    ctx.stroke();
  } else if (type === "instagram") {
    roundRectPath(ctx, -9.2, -9.2, 18.4, 18.4, 4.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -5, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "twitter") {
    ctx.font = "700 17px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("X", 0, 1);
  } else if (type === "facebook") {
    ctx.font = "700 19px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("f", 0, 1);
  }

  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (ctx.measureText(candidate).width <= maxWidth || !currentLine) {
      currentLine = candidate;
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

async function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to create image file."));
        return;
      }

      resolve(blob);
    }, type, quality);
  });
}

export default function FestivalPosterPreview({
  template,
  profile,
  backgroundPreviewUrl,
  showActions = false,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const resolvedProfile = useMemo(
    () => ({
      name: profile?.name || "Leader Name",
      greetingTagline: profile?.greetingTagline || "Designation / tagline",
      phone: profile?.phone || "",
      whatsappNumber: profile?.whatsappNumber || "",
      instagramHandle: profile?.instagramHandle || "",
      twitterHandle: profile?.twitterHandle || "",
      facebookHandle: profile?.facebookHandle || "",
      posterPhoto: profile?.posterPhoto || profile?.avatar || DEFAULT_AVATAR,
      avatar: profile?.avatar || DEFAULT_AVATAR,
      posterPhotoScale: Number(profile?.posterPhotoScale || 1),
      posterPhotoOffsetX: Number(profile?.posterPhotoOffsetX || 0),
      posterPhotoOffsetY: Number(profile?.posterPhotoOffsetY || 0),
    }),
    [profile]
  );

  useEffect(() => {
    let isMounted = true;

    async function renderPoster() {
      const canvas = canvasRef.current;

      if (!template) {
        setIsRendering(false);
        setRenderError("");
        return;
      }

      if (!canvas) {
        return;
      }

      setIsRendering(true);
      setRenderError("");

      try {
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Canvas preview is not available in this browser.");
        }

        const [backgroundImage, posterPhotoImage, avatarImage, logoImage] = await Promise.all([
          loadImage(backgroundPreviewUrl || template.backgroundImage),
          loadImage(resolvedProfile.posterPhoto),
          loadImage(resolvedProfile.avatar || resolvedProfile.posterPhoto),
          loadImage(DEFAULT_POSTER_LOGO),
        ]);

        if (!isMounted) {
          return;
        }

        canvas.width = DEFAULT_POSTER_SIZE.width;
        canvas.height = DEFAULT_POSTER_SIZE.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f8efe1";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (backgroundImage) {
          drawCoverImage(ctx, backgroundImage, 0, 0, canvas.width, canvas.height);
        }

        const overlayGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        overlayGradient.addColorStop(0, "rgba(15, 23, 42, 0.04)");
        overlayGradient.addColorStop(0.55, "rgba(15, 23, 42, 0.08)");
        overlayGradient.addColorStop(1, "rgba(15, 23, 42, 0.42)");
        ctx.fillStyle = overlayGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (posterPhotoImage) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(510, 260, 540, 1180);
          ctx.clip();
          drawCoverImage(ctx, posterPhotoImage, 510, 260, 540, 1180, {
            scale: resolvedProfile.posterPhotoScale,
            offsetX: resolvedProfile.posterPhotoOffsetX,
            offsetY: resolvedProfile.posterPhotoOffsetY,
          });
          ctx.restore();
        }

        const badgeCenterX = 126;
        const badgeCenterY = 124;
        const badgeRadius = 78;

        ctx.save();
        ctx.beginPath();
        ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = template.cardBackgroundColor || DEFAULT_POSTER_CARD_COLOR;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(badgeCenterX, badgeCenterY, badgeRadius - 10, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        drawCoverImage(ctx, avatarImage || posterPhotoImage, 38, 36, 176, 176);
        ctx.restore();

        ctx.lineWidth = 8;
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.beginPath();
        ctx.arc(badgeCenterX, badgeCenterY, badgeRadius - 4, 0, Math.PI * 2);
        ctx.stroke();

        if (logoImage) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(190, 176, 30, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStyle = "#ffffff";
          ctx.fill();
          ctx.clip();
          drawCoverImage(ctx, logoImage, 160, 146, 60, 60);
          ctx.restore();
        }

        const cardColor = template.cardBackgroundColor || DEFAULT_POSTER_CARD_COLOR;
        const stripColor =
          template.contactStripBackgroundColor || DEFAULT_POSTER_STRIP_COLOR;
        const nameColor = template.nameTextColor || DEFAULT_POSTER_NAME_COLOR;
        const taglineColor = template.taglineTextColor || DEFAULT_POSTER_TAGLINE_COLOR;
        const contactColor = template.contactTextColor || DEFAULT_POSTER_CONTACT_COLOR;
        const fontFamily = template.fontFamily || DEFAULT_POSTER_FONT;

        ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = cardColor;
        ctx.fillRect(0, 1072, 760, 168);

        ctx.shadowColor = "transparent";
        ctx.fillStyle = stripColor;
        ctx.fillRect(0, 1240, canvas.width, 110);

        ctx.fillStyle = nameColor;
        ctx.font = `700 58px ${fontFamily}, sans-serif`;
        ctx.textBaseline = "top";
        const nameLines = wrapText(ctx, resolvedProfile.name, 660).slice(0, 2);
        nameLines.forEach((line, index) => {
          ctx.fillText(line, 54, 1098 + index * 60);
        });

        ctx.fillStyle = taglineColor;
        ctx.font = `600 25px ${fontFamily}, sans-serif`;
        const taglineLines = wrapText(ctx, resolvedProfile.greetingTagline, 660).slice(0, 2);
        taglineLines.forEach((line, index) => {
          ctx.fillText(line, 54, 1172 + index * 31);
        });

        const contactItems = [
          { type: "phone", value: resolvedProfile.phone },
          { type: "whatsapp", value: resolvedProfile.whatsappNumber },
          { type: "instagram", value: resolvedProfile.instagramHandle },
          { type: "twitter", value: resolvedProfile.twitterHandle },
          { type: "facebook", value: resolvedProfile.facebookHandle },
        ].filter((item) => item.value);

        ctx.fillStyle = contactColor;
        ctx.font = `600 19px ${fontFamily}, sans-serif`;
        const stripY = 1240;
        const stripHeight = 110;
        const rowCenters = contactItems.length > 3 ? [stripY + 34, stripY + 78] : [stripY + 55, stripY + 55];
        const rowStartX = 26;
        const rowGap = 24;
        const rowLimitX = canvas.width - 26;
        const rows = [[], []];
        let activeRow = 0;
        let activeWidth = rowStartX;

        contactItems.forEach((item) => {
          const textWidth = ctx.measureText(String(item.value)).width;
          const itemWidth = Math.min(270, textWidth + 74);
          const exceedsRow = activeWidth !== rowStartX && activeWidth + itemWidth > rowLimitX;

          if (exceedsRow && activeRow === 0) {
            activeRow = 1;
            activeWidth = rowStartX;
          }

          rows[activeRow].push({ ...item, itemWidth });
          activeWidth += itemWidth + rowGap;
        });

        rows.forEach((rowItems, rowIndexValue) => {
          if (!rowItems.length) {
            return;
          }

          let currentX = rowStartX;
          const contactCenterY = rowCenters[rowIndexValue];

          rowItems.forEach((item) => {
            drawContactIcon(
              ctx,
              item.type,
              currentX + 16,
              contactCenterY,
              contactColor
            );

            ctx.fillStyle = contactColor;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = `600 19px ${fontFamily}, sans-serif`;
            ctx.fillText(String(item.value), currentX + 38, contactCenterY + 1);
            currentX += item.itemWidth + rowGap;
          });
        });

        setIsRendering(false);
      } catch (error) {
        if (isMounted) {
          setRenderError(error.message || "Unable to render poster preview.");
          setIsRendering(false);
        }
      }
    }

    renderPoster();

    return () => {
      isMounted = false;
    };
  }, [backgroundPreviewUrl, resolvedProfile, template]);

  const handleDownload = async (type) => {
    try {
      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error("Poster preview is not ready yet.");
      }

      const quality = type === "image/jpeg" ? 0.95 : undefined;
      const blob = await canvasToBlob(canvas, type, quality);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const extension = type === "image/jpeg" ? "jpg" : "png";

      anchor.href = objectUrl;
      anchor.download = `${template.slug || "festival-greeting"}.${extension}`;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setRenderError(error.message || "Unable to download poster.");
    }
  };

  const handleShare = async () => {
    try {
      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error("Poster preview is not ready yet.");
      }

      setIsSharing(true);
      const blob = await canvasToBlob(canvas, "image/png");
      const file = new File([blob], `${template.slug || "festival-greeting"}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: template.title,
          text: `Festival greeting by ${resolvedProfile.name}`,
          files: [file],
        });
        return;
      }

      await handleDownload("image/png");
      setRenderError("Direct file sharing is not supported here, so the poster was downloaded instead.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setRenderError(error.message || "Unable to share poster.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <section className={`rounded-[1.75rem] border border-border/60 bg-white/92 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Poster Preview
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            {template?.title || "Select a festival template"}
          </h3>
        </div>
        {isRendering ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <LoaderCircle className="size-3.5 animate-spin" />
            Rendering
          </div>
        ) : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-border/60 bg-slate-100">
        {template ? (
          <canvas
            ref={canvasRef}
            className="h-auto w-full bg-white"
            style={{ aspectRatio: `${DEFAULT_POSTER_SIZE.width} / ${DEFAULT_POSTER_SIZE.height}` }}
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Choose or create a template to see the composed greeting poster here.
          </div>
        )}
      </div>

      {renderError ? (
        <p className="mt-3 text-sm text-amber-700">{renderError}</p>
      ) : null}

      {showActions && template ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDownload("image/png")}
            disabled={isRendering}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Generate PNG
          </button>
          <button
            type="button"
            onClick={() => handleDownload("image/jpeg")}
            disabled={isRendering}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Generate JPEG
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isRendering || isSharing}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSharing ? <LoaderCircle className="size-4 animate-spin" /> : <Share2 className="size-4" />}
            Share
          </button>
        </div>
      ) : null}
    </section>
  );
}
