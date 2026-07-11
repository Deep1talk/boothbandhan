"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Images, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getGalleryImages } from "@/lib/client/galleryClient";

const GALLERY_PAGE_SIZE = 12;

const COPY = {
  en: {
    eyebrow: "Gallery",
    title: "Booth Bandhan image library",
    text: "Browse recent campaign, outreach, and community moments from our field activity.",
    backHome: "Back to home",
    empty: "No gallery images available yet.",
    loading: "Loading gallery...",
  },
  hi: {
    eyebrow: "गैलरी",
    title: "बूथ बंधन इमेज लाइब्रेरी",
    text: "हमारी हाल की अभियान, जनसंपर्क और सामुदायिक गतिविधियों की तस्वीरें देखें।",
    backHome: "होम पर वापस जाएं",
    empty: "अभी कोई गैलरी तस्वीर उपलब्ध नहीं है।",
    loading: "गैलरी लोड हो रही है...",
  },
};

export default function GalleryPageSection() {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.en;
  const [page, setPage] = useState(1);
  const { data, isLoading } = useRemoteData(
    () =>
      getGalleryImages({
        page,
        pageSize: GALLERY_PAGE_SIZE,
      }),
    {
      initialData: {
        images: [],
        pagination: {
          page: 1,
          pageSize: GALLERY_PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
          itemCount: 0,
          startIndex: 0,
          endIndex: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
      dependencyKey: JSON.stringify({ page }),
    }
  );

  const images = data?.images || [];
  const pagination = data?.pagination;

  return (
    <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">{copy.text}</p>
          </div>
          <Link
            href="/#gallery"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {copy.backHome}
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-10 flex min-h-64 items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <LoaderCircle className="size-4 animate-spin" />
              {copy.loading}
            </div>
          </div>
        ) : images.length ? (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-50 p-3 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-slate-100">
                    <Image
                      src={image.imageUrl}
                      alt="Booth Bandhan gallery"
                      fill
                      sizes="(max-width: 1279px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </article>
              ))}
            </div>

            {pagination?.totalPages > 1 ? (
              <div className="mt-8 flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4" />
                    Prev
                  </button>
                  <div className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    {pagination.page} / {pagination.totalPages}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(pagination.totalPages, current + 1))
                    }
                    disabled={!pagination.hasNextPage}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-10 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <Images className="size-6 text-orange-500" />
              {copy.empty}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
