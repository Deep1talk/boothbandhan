import Link from "next/link";
import { verifyEmailTokenAndMarkUser } from "@/lib/emailVerification";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";

function buildVerificationCopy(result) {
  if (result.ok) {
    if (result.code === "ALREADY_VERIFIED") {
      return {
        ok: true,
        title: "Email already verified",
        message: "This email address is already verified. You can continue to login.",
      };
    }

    return {
      ok: true,
      title: "Email verified",
      message: "Your email has been verified successfully.",
    };
  }

  if (result.code === "TOKEN_EXPIRED") {
    return {
      ok: false,
      title: "Verification expired",
      message: "This verification link has expired. Please request a new verification email.",
    };
  }

  if (result.code === "USER_NOT_FOUND") {
    return {
      ok: false,
      title: "User not found",
      message: "We could not find the account for this verification link.",
    };
  }

  return {
    ok: false,
    title: "Verification failed",
    message: result.message || "This verification link is invalid or unavailable.",
  };
}

export default async function EmailVerificationPage({ searchParams }) {
  const { token = "" } = await searchParams;
  const result = await verifyEmailTokenAndMarkUser(token);
  const copy = buildVerificationCopy(result);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg rounded-[2rem] border border-orange-200 bg-white p-8 text-center shadow-[0_28px_80px_-48px_rgba(15,23,42,0.35)]">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${
            copy.ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {copy.ok ? "OK" : "!"}
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{copy.message}</p>

        <div className="mt-8">
          <Link
            href={WEBSITE_LOGIN}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Go to login
          </Link>
        </div>
      </div>
    </section>
  );
}
