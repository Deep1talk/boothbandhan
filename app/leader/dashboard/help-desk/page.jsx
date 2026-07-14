import { getLeaderHelpDeskProblems } from "@/lib/helpDesk";
import { getCurrentUser } from "@/lib/authUser";
import LeaderHelpDeskSection from "@/components/leader/helpdesk/LeaderHelpDeskSection";

export default async function LeaderHelpDeskPage() {
  const { user } = await getCurrentUser();
  const initialProblems = user?.id ? await getLeaderHelpDeskProblems(user.id) : [];

  return <LeaderHelpDeskSection initialProblems={initialProblems} leader={user} />;
}
