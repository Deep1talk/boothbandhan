"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/public/assests/images/logo.webp";
import { zodOtpVerifySchema } from "@/lib/zodSchema";
import { WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD, WEBSITE_UPDATEPASSWORD } from "@/routes/websiteRoutes";
import { toastAlert } from "@/lib/toastAlert";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { translateAuthMessage, translateFieldError } from "@/lib/publicLanguage";

const OtpVerifyPage = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() || "";
  const copy = language === "hi" ? {
    title: "ओटीपी सत्यापित करें",
    subtitle: "हमने जो 6 अंकों का ओटीपी भेजा है, उसे दर्ज करें।",
    otpSentTo: "ओटीपी भेजा गया है:",
    otp: "ओटीपी",
    otpPlaceholder: "6 अंकों का ओटीपी दर्ज करें",
    submitting: "ओटीपी सत्यापित हो रहा है...",
    submit: "ओटीपी सत्यापित करें",
    resend: "ओटीपी दोबारा भेजें",
    createAccount: "खाता बनाएं",
    backToLogin: "लॉग इन पर वापस जाएं",
    missingEmail: "रीसेट ईमेल नहीं मिला। कृपया नया ओटीपी प्राप्त करें।",
    successTitle: "ओटीपी सत्यापित",
    errorTitle: "ओटीपी सत्यापन असफल",
  } : {
    title: "Verify OTP",
    subtitle: "Enter the 6-digit OTP we sent you.",
    otpSentTo: "OTP sent to",
    otp: "OTP",
    otpPlaceholder: "Enter 6-digit OTP",
    submitting: "Verifying OTP...",
    submit: "Verify OTP",
    resend: "Resend OTP",
    createAccount: "Create an account",
    backToLogin: "Back to login",
    missingEmail: "Reset email is missing. Please request a new OTP.",
    successTitle: "OTP verified",
    errorTitle: "OTP verification failed",
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodOtpVerifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      if (!email) {
        throw new Error(copy.missingEmail);
      }

      const { data: verifyOtpResponse } = await axios.post("/api/auth/reset-password/verify-otp", {
        email,
        otp: data.otp,
      });

      if (!verifyOtpResponse.success) {
        throw new Error(verifyOtpResponse.message);
      }

      toastAlert("success", copy.successTitle, translateAuthMessage(verifyOtpResponse.message, language));
      router.push(`${WEBSITE_UPDATEPASSWORD}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toastAlert(
        "error",
        copy.errorTitle,
        translateAuthMessage(err.response?.data?.message || err.message || "Please try again.", language)
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-[500px] rounded-xl border border-border bg-card px-6 py-6 text-card-foreground shadow-sm">
        <div className="space-y-6">
          <div className="flex justify-center">
            <Image src={Logo} alt="logo" width={100} height={100} />
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">{copy.title}</h1>
            <p className="text-sm text-muted-foreground">
              {copy.subtitle}
            </p>
            {email ? <p className="text-xs text-muted-foreground">{copy.otpSentTo} {email}</p> : null}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="otp">
                {copy.otp}
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={copy.otpPlaceholder}
                {...register("otp")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm tracking-[0.35em] outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              {errors.otp ? (
                <p className="text-sm text-destructive">
                  {translateFieldError(errors.otp.message, language)}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  {copy.submitting}
                </>
              ) : (
                copy.submit
              )}
            </button>

            <div className="flex items-center justify-between gap-4 text-sm">
              <Link
                href={WEBSITE_RESETPASSWORD}
                className="text-muted-foreground transition hover:text-primary"
              >
                {copy.resend}
              </Link>
              <Link
                href={WEBSITE_REGISTER}
                className="font-medium text-primary transition hover:opacity-80"
              >
                {copy.createAccount}
              </Link>
            </div>
          </form>

          <div className="flex justify-center text-sm">
            <Link href={WEBSITE_LOGIN} className="text-muted-foreground transition hover:text-primary">
              {copy.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
