import RoleDashboardShell from "@/components/shared/layout/RoleDashboardShell";
import {
  LEADER_DASHBOARD,
  LEADER_HELP_DESK,
  LEADER_PROFILE,
} from "@/routes/leaderpanelRoutes";

export default function LeaderDashboardLayoutShell({ session, children }) {
  return (
    <RoleDashboardShell
      badge="Leader panel"
      title="Leader workspace"
      session={session}
      profileHref={LEADER_PROFILE}
      navigation={[
        { label: "Overview", href: LEADER_DASHBOARD, icon: "overview" },
        { label: "Help Desk", href: LEADER_HELP_DESK, icon: "helpDesk" },
        { label: "Profile", href: LEADER_PROFILE, icon: "user" },
      ]}
      mobileNavigation={[
        { label: "Overview", href: LEADER_DASHBOARD, icon: "overview" },
        { label: "Help Desk", href: LEADER_HELP_DESK, icon: "helpDesk" },
      ]}
      mobileFullWidthTopSections
      sidePanel={[]}
      accent={{
        shell: "bg-[linear-gradient(180deg,_#f7fef9_0%,_#fbfffc_40%,_#ffffff_100%)]",
        nav: "bg-emerald-500 text-white",
        navSoft: "bg-emerald-50 text-emerald-950 border-emerald-200/70",
        badge: "bg-emerald-100 text-emerald-950",
        panel: "bg-emerald-500",
        panelSoft: "bg-emerald-50 border-emerald-200/70",
      }}
    >
      {children}
    </RoleDashboardShell>
  );
}
