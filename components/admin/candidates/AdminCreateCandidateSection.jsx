import CreateManagedUserForm from "@/components/shared/forms/CreateManagedUserForm";

export default function AdminCreateCandidateSection({ onSuccess }) {
  return (
    <CreateManagedUserForm
      title="Create Candidate"
      description="New candidates link to your account automatically."
      submitLabel="Create Candidate"
      accentClass="from-orange-50 via-white to-amber-50"
      onSuccess={onSuccess}
      sectionId="create-candidate"
    />
  );
}
