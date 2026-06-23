export const ADMIN_DASHBOARD = "/admin/dashboard";
export const ADMIN_PROFILE = "/admin/dashboard/profile";
export const ADMIN_CREATE_CANDIDATE = "/admin/dashboard/create-candidate";
export const ADMIN_CANDIDATES = "/admin/dashboard/candidates";
export const ADMIN_DIRECT_LEADERS = "/admin/dashboard/direct-leaders";
export const getAdminCandidateOverviewRoute = (candidateId) =>
  `/admin/dashboard/candidates/${candidateId}`;
export const getAdminCandidateLeadersRoute = (candidateId) =>
  `/admin/dashboard/candidates/${candidateId}/leaders`;
