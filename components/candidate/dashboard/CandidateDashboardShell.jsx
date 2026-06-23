import RoleDashboardShell from "@/components/shared/layout/RoleDashboardShell";
import {
  CANDIDATE_CREATE_LEADER,
  CANDIDATE_DASHBOARD,
  CANDIDATE_LEADERS,
  CANDIDATE_PROFILE,
} from "@/routes/candidatepanelRoutes";

export default function CandidateDashboardLayoutShell({ session, children }) {
  return (
    <RoleDashboardShell
      badge="Candidate panel"
      title="Candidate workspace"
      session={session}
      profileHref={CANDIDATE_PROFILE}
      navigation={[
        { label: "Overview", href: CANDIDATE_DASHBOARD, icon: "overview" },
        { label: "Create Leader", href: CANDIDATE_CREATE_LEADER, icon: "add" },
        { label: "Leaders", href: CANDIDATE_LEADERS, icon: "list" },
        { label: "Profile", href: CANDIDATE_PROFILE, icon: "user" },
      ]}
      mobileNavigation={[
        { label: "Overview", href: CANDIDATE_DASHBOARD, icon: "overview" },
        { label: "Create Leader", href: CANDIDATE_CREATE_LEADER, icon: "add" },
        { label: "Leaders", href: CANDIDATE_LEADERS, icon: "list" },
      ]}
      mobileFullWidthTopSections
      sidePanel={[]}
      accent={{
        shell: "bg-[linear-gradient(180deg,_#f6fbff_0%,_#fbfeff_40%,_#ffffff_100%)]",
        nav: "bg-sky-500 text-white",
        navSoft: "bg-sky-50 text-sky-950 border-sky-200/70",
        badge: "bg-sky-100 text-sky-950",
        panel: "bg-sky-500",
        panelSoft: "bg-sky-50 border-sky-200/70",
      }}
    >
      {children}
    </RoleDashboardShell>
  );
}
