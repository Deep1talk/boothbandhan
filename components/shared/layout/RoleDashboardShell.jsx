"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Globe,
  LifeBuoy,
  ListTree,
  LogIn,
  PlusCircle,
  UserRound,
} from "lucide-react";
import LogoutButton from "@/components/shared/auth/LogoutButton";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";

const ICON_MAP = {
  overview: FolderKanban,
  helpDesk: LifeBuoy,
  list: ListTree,
  add: PlusCircle,
  user: UserRound,
};

const DASHBOARD_TRANSLATIONS = {
  hi: {
    english: "English",
    hindi: "हिंदी",
    profile: "प्रोफाइल",
    manageProfile: "प्रोफाइल प्रबंधित करें",
    logout: "लॉग आउट",
    login: "लॉग इन",
    welcomeBack: "वापसी पर स्वागत है",
    account: "खाता",
    dashboard: "डैशबोर्ड",
    dashboardText:
      "बड़े टच टारगेट, सरल नेविगेशन और साफ सेक्शनों के साथ तेज़ मोबाइल-फ्रेंडली काम के लिए तैयार।",
    signedInAs: "इस रूप में साइन इन:",
    optimized: "फोन और डेस्कटॉप दोनों के लिए अनुकूलित",
    roles: {
      Admin: "एडमिन",
      Candidate: "उम्मीदवार",
      Leader: "लीडर",
    },
    labels: {
      "Admin panel": "एडमिन पैनल",
      "Admin workspace": "एडमिन कार्यक्षेत्र",
      "Candidate panel": "उम्मीदवार पैनल",
      "Candidate workspace": "उम्मीदवार कार्यक्षेत्र",
      "Leader panel": "लीडर पैनल",
      "Leader workspace": "लीडर कार्यक्षेत्र",
      Overview: "ओवरव्यू",
      "Create Candidate": "उम्मीदवार बनाएं",
      Candidates: "उम्मीदवार",
      "Direct Leaders": "प्रत्यक्ष लीडर",
      Profile: "प्रोफाइल",
      "Create Leader": "लीडर बनाएं",
      Leaders: "लीडर",
      "Help Desk": "हेल्प डेस्क",
    },
  },
  en: {
    english: "English",
    hindi: "हिंदी",
    profile: "Profile",
    manageProfile: "Manage profile",
    logout: "Logout",
    login: "Login",
    welcomeBack: "Welcome back",
    account: "Account",
    dashboard: "Dashboard",
    dashboardText:
      "Built for quick mobile-friendly work with larger touch targets, simpler navigation, and cleaner sections.",
    signedInAs: "Signed in as",
    optimized: "Optimized for phone and desktop",
    roles: {
      Admin: "Admin",
      Candidate: "Candidate",
      Leader: "Leader",
    },
    labels: {},
  },
};

export default function RoleDashboardShell({
  badge,
  title,
  session,
  profileHref,
  stats = [],
  navigation = [],
  mobileNavigation,
  mobileFullWidthTopSections = false,
  sidePanel = [],
  children,
  accent = {
    shell: "bg-[linear-gradient(180deg,_#fffaf5_0%,_#fffdf8_40%,_#ffffff_100%)]",
    nav: "bg-orange-500 text-white",
    navSoft: "bg-orange-50 text-orange-950 border-orange-200/70",
    badge: "bg-orange-100 text-orange-900",
    panel: "bg-orange-500",
    panelSoft: "bg-orange-50 border-orange-200/70",
  },
}) {
  const { language, toggleLanguage } = useLanguage();
  const copy = DASHBOARD_TRANSLATIONS[language] || DASHBOARD_TRANSLATIONS.en;
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const profileMenuCloseTimeoutRef = useRef(null);
  const hasSidePanel = sidePanel.length > 0;
  const hasStats = stats.length > 0;

  const desktopNavigation = navigation.slice(0, 5);
  const mobileNavigationItems = (mobileNavigation || navigation).slice(0, 4);
  const containerPaddingClasses = mobileFullWidthTopSections
    ? "px-0 py-3 sm:px-4 sm:py-4 lg:px-5"
    : "px-3 py-3 sm:px-4 sm:py-4 lg:px-5";
  const mobileTopSectionClasses = mobileFullWidthTopSections
    ? "rounded-none border-x-0 px-3 sm:rounded-[1.5rem] sm:border-x sm:px-4"
    : "rounded-[1.5rem]";
  const mobileHeroSectionClasses = mobileFullWidthTopSections
    ? "rounded-none border-x-0 sm:rounded-[2rem] sm:border-x"
    : "rounded-[2rem]";
  const mobileContentPaddingClasses = mobileFullWidthTopSections ? "px-3 sm:px-0" : "";
  const translateLabel = (value) => copy.labels[value] || value;
  const roleLabel = copy.roles[session.role] || session.role;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      if (profileMenuCloseTimeoutRef.current) {
        clearTimeout(profileMenuCloseTimeoutRef.current);
      }
    };
  }, []);

  const openProfileMenu = () => {
    if (profileMenuCloseTimeoutRef.current) {
      clearTimeout(profileMenuCloseTimeoutRef.current);
      profileMenuCloseTimeoutRef.current = null;
    }
    setIsProfileMenuOpen(true);
  };

  const closeProfileMenuWithDelay = () => {
    if (profileMenuCloseTimeoutRef.current) {
      clearTimeout(profileMenuCloseTimeoutRef.current);
    }
    profileMenuCloseTimeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
      profileMenuCloseTimeoutRef.current = null;
    }, 180);
  };

  return (
    <main className={`min-h-screen pb-24 md:pb-8 ${accent.shell}`}>
      <div className={`mx-auto max-w-[1500px] ${containerPaddingClasses}`}>
        <header
          className={`sticky top-0 z-30 mb-4 border border-white/80 bg-white/90 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl ${mobileTopSectionClasses}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-white text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-accent"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => router.forward()}
                aria-label="Go forward"
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-white text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-accent"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-border/70 bg-white px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-accent"
              >
                <Globe className="size-4" />
                <span>{language === "hi" ? copy.english : copy.hindi}</span>
              </button>

              {profileHref ? (
                <div
                  ref={profileMenuRef}
                  className="relative"
                  onMouseEnter={openProfileMenu}
                  onMouseLeave={closeProfileMenuWithDelay}
                >
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((current) => !current)}
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Open profile menu"
                    className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-border/70 bg-white px-2.5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-accent sm:pl-2 sm:pr-4"
                  >
                    <div className="relative size-9 overflow-hidden rounded-xl border border-border/60">
                      <Image
                        src={session.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={session.name || "User profile"}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <span className="hidden sm:inline">{copy.profile}</span>
                  </button>

                  {isProfileMenuOpen ? (
                    <div className="absolute right-0 top-[calc(100%+0.6rem)] z-40 flex min-w-52 flex-col gap-2 rounded-[1.25rem] border border-white/80 bg-white/96 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                      <Link
                        href={profileHref}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                      >
                        <UserRound className="size-4" />
                        {copy.manageProfile}
                      </Link>

                      {session?.userId ? (
                        <LogoutButton
                          label={copy.logout}
                          className="w-full justify-start border-transparent bg-transparent px-3 shadow-none hover:bg-accent"
                        />
                      ) : (
                        <Link
                          href={WEBSITE_LOGIN}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                        >
                          <LogIn className="size-4" />
                          {copy.login}
                        </Link>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section
          className={`mb-4 overflow-hidden border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:hidden ${mobileHeroSectionClasses}`}
        >
          <div className={`px-4 pb-4 pt-5 ${accent.shell}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] shadow-sm ${accent.badge}`}>
                  {translateLabel(badge)}
                </span>
                <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                  {translateLabel(title)}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {copy.welcomeBack}, {session.name?.split(" ")[0] || session.email}
                </p>
              </div>
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[1.25rem] border border-white/80 shadow-sm">
                <Image
                  src={session.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                  alt={session.name || "User avatar"}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm ${accent.nav}`}>
                {roleLabel}
              </div>
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="inline-flex rounded-full border border-border/60 bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground"
                >
                  {copy.profile}
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <div className={mobileContentPaddingClasses}>
          <div
            className={`grid gap-4 ${
              hasSidePanel
                ? "xl:grid-cols-[260px_minmax(0,1fr)_320px]"
                : "xl:grid-cols-[260px_minmax(0,1fr)]"
            }`}
          >
            <aside className="hidden xl:block">
              <div className="fixed top-24 h-[calc(100vh-7rem)] w-[260px] overflow-auto rounded-[1.75rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 sm:pb-4">
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${accent.badge}`}>
                      {translateLabel(badge)}
                    </span>
                    <h1 className="mt-3 text-lg font-semibold text-foreground sm:text-xl">
                      {translateLabel(title)}
                    </h1>
                  </div>
                  <div className={`hidden rounded-2xl px-3 py-2 text-xs font-semibold shadow-sm sm:block ${accent.nav}`}>
                    {roleLabel}
                  </div>
                </div>

                <div className="mt-4 xl:space-y-2">
                  {desktopNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-sm font-medium transition ${
                        pathname === item.href
                          ? `${accent.nav} border-transparent shadow-lg`
                          : `${accent.navSoft} hover:translate-x-0.5`
                      }`}
                    >
                      {(() => {
                        const Icon = ICON_MAP[item.icon] || UserRound;
                        return <Icon className="size-4" />;
                      })()}
                      {translateLabel(item.label)}
                    </Link>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {copy.account}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-2xl border border-border/60">
                      <Image
                        src={session.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={session.name || "User avatar"}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {session.name || session.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground sm:text-sm">
                        {session.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:mt-4">
                    <LogoutButton label={copy.logout} />
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-4">
              <section
                id="overview"
                className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {copy.dashboard}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {translateLabel(title)}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {copy.dashboardText}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={`inline-flex w-fit rounded-2xl px-3 py-2 text-[11px] font-semibold shadow-sm sm:text-xs ${accent.nav}`}>
                      {copy.signedInAs} {roleLabel}
                    </div>
                    <div className="inline-flex rounded-2xl border border-border/60 bg-white px-3 py-2 text-[11px] font-semibold text-muted-foreground shadow-sm sm:text-xs">
                      {copy.optimized}
                    </div>
                  </div>
                </div>
              </section>

              {hasStats ? (
                <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  {stats.map(({ label, value, detail, icon: Icon }) => (
                    <article
                      key={label}
                      className="rounded-[1.5rem] border border-white/70 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            {translateLabel(label)}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-foreground sm:mt-3 sm:text-3xl">
                            {value}
                          </p>
                        </div>
                        <div className={`rounded-2xl p-2.5 text-white shadow-lg sm:p-3 ${accent.panel}`}>
                          <Icon className="size-4 sm:size-5" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
                    </article>
                  ))}
                </section>
              ) : null}

              <div className="space-y-4">{children}</div>
            </div>

            {hasSidePanel ? (
              <aside className="space-y-4 xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-auto">
                {sidePanel.map((item) => (
                  <section
                    key={item.label}
                    className={`rounded-[1.75rem] border bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5 ${accent.panelSoft}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {translateLabel(item.label)}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground sm:mt-3 sm:text-2xl">
                      {item.value}
                    </p>
                    {item.detail ? (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    ) : null}
                  </section>
                ))}
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-white/92 px-3 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-3 shadow-[0_-18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {mobileNavigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[1.2rem] px-2 py-2 text-center text-[11px] font-semibold transition ${
                  isActive
                    ? `${accent.nav} shadow-lg`
                    : "bg-slate-100/85 text-slate-600"
                }`}
              >
                {(() => {
                  const Icon = ICON_MAP[item.icon] || UserRound;
                  return <Icon className="size-4.5" />;
                })()}
                <span className="leading-tight">{translateLabel(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
