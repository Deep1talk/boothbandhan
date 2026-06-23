import { redirect } from "next/navigation";
import CandidateDashboardLayoutShell from "@/components/candidate/dashboard/CandidateDashboardShell";
import { getDefaultRouteForRole } from "@/lib/authRedirect";
import { getCurrentUser } from "@/lib/authUser";
import { CANDIDATE_DASHBOARD } from "@/routes/candidatepanelRoutes";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";

export default async function CandidateDashboardLayout({ children }) {
  const { session, user } = await getCurrentUser();

  if (!session?.userId || !user) {
    redirect(`${WEBSITE_LOGIN}?callback=${encodeURIComponent(CANDIDATE_DASHBOARD)}`);
  }

  if (user.isLocked) {
    redirect("/api/auth/logout?reason=locked");
  }

  if (user.role !== "Candidate") {
    redirect(getDefaultRouteForRole(user.role));
  }

  return (
    <CandidateDashboardLayoutShell
      session={{ ...session, ...user, userId: user.id }}
    >
      {children}
    </CandidateDashboardLayoutShell>
  );
}
