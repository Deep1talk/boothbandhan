"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images, LoaderCircle } from "lucide-react";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getGalleryImages } from "@/lib/client/galleryClient";

const COPY = {
  en: {
    eyebrow: "Gallery",
    title: "Moments from the field",
    text: "A quick look at our latest activity, outreach, and ground-level campaign moments.",
    viewMore: "View more",
    empty: "Gallery images will appear here soon.",
    loading: "Loading gallery...",
  },
  hi: {
    eyebrow: "गैलरी",
    title: "मैदान से कुछ झलकियां",
    text: "हमारी नवीनतम गतिविधियों, जनसंपर्क और जमीनी अभियानों की एक झलक।",
    viewMore: "और देखें",
    empty: "गैलरी की तस्वीरें जल्द यहां दिखाई देंगी।",
    loading: "गैलरी लोड हो रही है...",
  },
};

export default function HomeGallerySection() {
  const { language } = useLanguage();
  const copy = COPY[language] || COPY.en;
  const { data, isLoading } = useRemoteData(
    () =>
      getGalleryImages({
        limit: 6,
      }),
    {
      initialData: {
        images: [],
      },
    }
  );

  const images = data?.images || [];

  return (
    <section
      id="gallery"
      className="border-y border-[#edf0e6] bg-[linear-gradient(180deg,_#ffffff_0%,_#fafaf7_100%)]"
    >
      <div className="mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.26em] text-orange-500">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {copy.title}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">{copy.text}</p>
      </div>

      {isLoading ? (
        <div className="mt-12 flex min-h-56 items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <LoaderCircle className="size-4 animate-spin" />
            {copy.loading}
          </div>
        </div>
      ) : images.length ? (
        <>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {images.slice(0, 4).map((image, index) => (
              <article
                key={image.id}
                className={`group overflow-hidden rounded-[1.6rem] border border-[#e7ece3] bg-white p-3 shadow-[0_24px_60px_-44px_rgba(15,23,42,0.34)] ${
                  index === 0 ? "md:col-span-2 xl:col-span-1" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-slate-100">
                  <Image
                    src={image.imageUrl}
                    alt="Booth Bandhan gallery"
                    fill
                    sizes="(max-width: 1279px) 100vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0d5c45]/20 bg-white px-6 py-3 text-sm font-semibold text-[#0d5c45] transition hover:bg-[#f5faf7]"
            >
              <Images className="size-4" />
              {copy.viewMore}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-12 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
          {copy.empty}
        </div>
      )}
      </div>
    </section>
  );
}
