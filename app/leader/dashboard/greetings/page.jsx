import LeaderGreetingStudioSection from "@/components/leader/greetings/LeaderGreetingStudioSection";
import { getCurrentUser } from "@/lib/authUser";
import { connectDB } from "@/lib/connectDB";
import {
  isTemplateLive,
  normalizeFestivalTemplate,
  normalizePosterProfile,
} from "@/lib/posters";
import FestivalTemplateModel from "@/models/festivalTemplateSchema";
import UserModel from "@/models/userSchema";

export default async function LeaderGreetingsPage() {
  const { session } = await getCurrentUser();

  await connectDB();

  const [leader, templates] = await Promise.all([
    UserModel.findById(session.userId).lean(),
    FestivalTemplateModel.find({ isActive: true }).sort({ updatedAt: -1 }).lean(),
  ]);

  return (
    <LeaderGreetingStudioSection
      initialProfile={normalizePosterProfile(leader)}
      initialTemplates={templates.filter(isTemplateLive).map(normalizeFestivalTemplate)}
    />
  );
}
