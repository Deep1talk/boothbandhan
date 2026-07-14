import { redirect } from "next/navigation";

export default async function LegacyEmailVerificationPage({ params }) {
  const { token } = await params;
  redirect(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}
