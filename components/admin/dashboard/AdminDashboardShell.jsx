import RoleDashboardShell from "@/components/shared/layout/RoleDashboardShell";
import {
  ADMIN_ANNOUNCEMENTS,
  ADMIN_CANDIDATES,
  ADMIN_CREATE_CANDIDATE,
  ADMIN_DASHBOARD,
  ADMIN_DIRECT_LEADERS,
  ADMIN_GALLERY,
  ADMIN_GREETING_TEMPLATES,
  ADMIN_PROFILE,
} from "@/routes/adminpanelRoutes";

export default function AdminDashboardLayoutShell({ session, children }) {
  return (
    <RoleDashboardShell
      badge="Admin panel"
      title="Admin workspace"
      session={session}
      profileHref={ADMIN_PROFILE}
      navigation={[
        { label: "Overview", href: ADMIN_DASHBOARD, icon: "overview" },
        { label: "Create Field Associate", href: ADMIN_CREATE_CANDIDATE, icon: "add" },
        { label: "Field Associates", href: ADMIN_CANDIDATES, icon: "list" },
        { label: "Direct Leaders", href: ADMIN_DIRECT_LEADERS, icon: "user" },
        { label: "Greeting Templates", href: ADMIN_GREETING_TEMPLATES, icon: "poster" },
        { label: "Gallery", href: ADMIN_GALLERY, icon: "gallery" },
        { label: "Announcements", href: ADMIN_ANNOUNCEMENTS, icon: "bell" },
      ]}
      mobileNavigation={[
        { label: "Overview", href: ADMIN_DASHBOARD, icon: "overview" },
        { label: "Create Field Associate", href: ADMIN_CREATE_CANDIDATE, icon: "add" },
        { label: "Field Associates", href: ADMIN_CANDIDATES, icon: "list" },
        { label: "Direct Leaders", href: ADMIN_DIRECT_LEADERS, icon: "user" },
      ]}
      sidePanel={[]}
      accent={{
        shell: "bg-[linear-gradient(180deg,_#fffaf5_0%,_#fffdf8_40%,_#ffffff_100%)]",
        nav: "bg-orange-500 text-white",
        navSoft: "bg-orange-50 text-orange-950 border-orange-200/70",
        badge: "bg-orange-100 text-orange-900",
        panel: "bg-orange-500",
        panelSoft: "bg-orange-50 border-orange-200/70",
      }}
    >
      {children}
    </RoleDashboardShell>
  );
}
