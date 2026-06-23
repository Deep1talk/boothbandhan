import { redirect } from "next/navigation";
import AdminDashboardLayoutShell from "@/components/admin/dashboard/AdminDashboardShell";
import { getDefaultRouteForRole } from "@/lib/authRedirect";
import { getCurrentUser } from "@/lib/authUser";
import { ADMIN_DASHBOARD } from "@/routes/adminpanelRoutes";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";

export default async function AdminDashboardLayout({ children }) {
  const { session, user } = await getCurrentUser();

  if (!session?.userId || !user) {
    redirect(`${WEBSITE_LOGIN}?callback=${encodeURIComponent(ADMIN_DASHBOARD)}`);
  }

  if (user.isLocked) {
    redirect("/api/auth/logout?reason=locked");
  }

  if (user.role !== "Admin") {
    redirect(getDefaultRouteForRole(user.role));
  }

  return (
    <AdminDashboardLayoutShell
      session={{ ...session, ...user, userId: user.id }}
    >
      {children}
    </AdminDashboardLayoutShell>
  );
}
