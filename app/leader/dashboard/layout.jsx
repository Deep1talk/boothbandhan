import { redirect } from "next/navigation";
import LeaderDashboardLayoutShell from "@/components/leader/dashboard/LeaderDashboardShell";
import { getDefaultRouteForRole } from "@/lib/authRedirect";
import { getCurrentUser } from "@/lib/authUser";
import { LEADER_DASHBOARD } from "@/routes/leaderpanelRoutes";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";

export default async function LeaderDashboardLayout({ children }) {
  const { session, user } = await getCurrentUser();

  if (!session?.userId || !user) {
    redirect(`${WEBSITE_LOGIN}?callback=${encodeURIComponent(LEADER_DASHBOARD)}`);
  }

  if (user.isLocked) {
    redirect("/api/auth/logout?reason=locked");
  }

  if (user.role !== "Leader") {
    redirect(getDefaultRouteForRole(user.role));
  }

  return (
    <LeaderDashboardLayoutShell
      session={{ ...session, ...user, userId: user.id }}
    >
      {children}
    </LeaderDashboardLayoutShell>
  );
}
