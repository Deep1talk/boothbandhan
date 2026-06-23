"use client";

import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { WEBSITE_HOME } from "@/routes/websiteRoutes";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";

const AuthLayout = ({ children }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-4 py-16">
      <Link
        href={WEBSITE_HOME}
        className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 sm:left-6 sm:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === "hi" ? "होम पर जाएं" : "Back to Home"}
      </Link>
      <button
        type="button"
        onClick={toggleLanguage}
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 sm:right-6 sm:top-6"
      >
        <Globe className="h-4 w-4" />
        {language === "hi" ? "English" : "हिंदी"}
      </button>
      {children}
    </div>
  );
};

export default AuthLayout;
