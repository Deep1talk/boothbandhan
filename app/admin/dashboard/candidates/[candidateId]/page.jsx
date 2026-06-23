import AdminCandidateLeadersPageSection from "@/components/admin/leaders/AdminCandidateLeadersPageSection";

export default async function AdminCandidateOverviewPage({ params }) {
  const { candidateId } = await params;

  return <AdminCandidateLeadersPageSection candidateId={candidateId} />;
}
