import CreateManagedUserForm from "@/components/shared/forms/CreateManagedUserForm";

export default function AdminCreateCandidateSection({ onSuccess }) {
  return (
    <CreateManagedUserForm
      title="Create Field Associate"
      description="New field associates link to your account automatically."
      submitLabel="Create Field Associate"
      accentClass="from-orange-50 via-white to-amber-50"
      onSuccess={onSuccess}
      sectionId="create-candidate"
    />
  );
}
