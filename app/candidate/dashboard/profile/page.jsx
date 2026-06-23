import { getCurrentUser } from "@/lib/authUser";
import ProfileManagementSection from "@/components/shared/account/ProfileManagementSection";

export default async function CandidateProfilePage() {
  const { user } = await getCurrentUser();

  return <ProfileManagementSection user={user} />;
}
