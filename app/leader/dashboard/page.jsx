import { getCurrentUser } from "@/lib/authUser";

export default async function LeaderDashboardPage() {
  const { user } = await getCurrentUser();

  return (
    <section
      id="overview"
      className="rounded-[1.5rem] border border-border/60 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {[
          {
            title: "Parent status",
            text: user?.parentId ? "Linked to candidate" : "Standalone account",
          },
          {
            title: "Role",
            text: "Leader",
          },
          {
            title: "Profile tools",
            text: "You can now update your photo and password from the Profile page.",
          },
          {
            title: "Greeting Template",
            text: "Open Greeting Template to generate festival posters with your photo, tagline, and contact details on active templates.",
          },
          {
            title: "Help desk",
            text: "Use the Help Desk page to submit public problems from your area for admin review.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border/60 bg-white/85 p-4 sm:p-5"
          >
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
