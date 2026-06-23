import { ADMIN_DASHBOARD } from "@/routes/adminpanelRoutes";
import { CANDIDATE_DASHBOARD } from "@/routes/candidatepanelRoutes";
import { LEADER_DASHBOARD } from "@/routes/leaderpanelRoutes";
import { WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, } from "@/routes/websiteRoutes";

const DASHBOARD_ROUTE_BY_ROLE = {
  Admin: ADMIN_DASHBOARD,
  Candidate: CANDIDATE_DASHBOARD,
  Leader: LEADER_DASHBOARD,
};

const ROLE_BY_ROUTE_PREFIX = [
  ["/admin", "Admin"],
  ["/candidate", "Candidate"],
  ["/leader", "Leader"],
];

export const ROLE_DASHBOARD_ROUTES = Object.freeze(DASHBOARD_ROUTE_BY_ROLE);
export const PUBLIC_AUTH_ROUTES = [WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER];

export function getDefaultRouteForRole(role) {
  return DASHBOARD_ROUTE_BY_ROLE[role] ?? WEBSITE_HOME;
}

export function isSafeCallbackPath(callback) {
  return (
    typeof callback === "string" &&
    callback.startsWith("/") &&
    !callback.startsWith("//") &&
    !callback.startsWith("/auth/")
  );
}

export function getPostLoginRoute({ role, callback }) {
  return isSafeCallbackPath(callback) ? callback : getDefaultRouteForRole(role);
}

export function getRequiredRoleForPath(pathname) {
  const matchedRoute = ROLE_BY_ROUTE_PREFIX.find(([prefix]) => pathname.startsWith(prefix));
  return matchedRoute?.[1] ?? null;
}
