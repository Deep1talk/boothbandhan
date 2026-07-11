import CreateManagedUserForm from "@/components/shared/forms/CreateManagedUserForm";

export default function CandidateCreateLeaderSection({ onSuccess }) {
  return (
    <CreateManagedUserForm
      title="Register Leader"
      description="Create a leader account with full personal, area, and political details linked to your field associate profile."
      submitLabel="Register Leader"
      accentClass="from-sky-50 via-white to-cyan-50"
      submitButtonClass="bg-sky-600 text-white hover:bg-sky-700"
      onSuccess={onSuccess}
      sectionId="create-leader"
      variant="leader"
    />
  );
}
