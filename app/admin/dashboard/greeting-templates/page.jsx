import AdminGreetingTemplatesSection from "@/components/admin/posters/AdminGreetingTemplatesSection";
import { connectDB } from "@/lib/connectDB";
import { normalizeFestivalTemplate } from "@/lib/posters";
import FestivalTemplateModel from "@/models/festivalTemplateSchema";

export const dynamic = "force-dynamic";

export default async function AdminGreetingTemplatesPage() {
  await connectDB();

  const templates = await FestivalTemplateModel.find({})
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <AdminGreetingTemplatesSection
      initialTemplates={templates.map(normalizeFestivalTemplate)}
    />
  );
}
