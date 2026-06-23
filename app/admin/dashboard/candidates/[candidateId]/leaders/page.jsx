import AdminCandidateLeadersPageSection from "@/components/admin/leaders/AdminCandidateLeadersPageSection";

export default async function AdminCandidateLeadersPage({ params }) {
  const { candidateId } = await params;

  return <AdminCandidateLeadersPageSection candidateId={candidateId} />;
}
