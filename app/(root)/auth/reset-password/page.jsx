"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/public/assests/images/logo.webp";
import { toastAlert } from "@/lib/toastAlert";
import { zodSendOtpSchema } from "@/lib/zodSchema";
import { WEBSITE_LOGIN, WEBSITE_OTPVERIFY, WEBSITE_REGISTER } from "@/routes/websiteRoutes";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { translateAuthMessage, translateFieldError } from "@/lib/publicLanguage";

const ResetPasswordPage = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const copy = language === "hi" ? {
    title: "अपना पासवर्ड रीसेट करें",
    subtitle: "अपने खाते से जुड़ा ईमेल पता दर्ज करें, हम आपको 6 अंकों का ओटीपी भेजेंगे।",
    email: "ईमेल",
    emailPlaceholder: "you@example.com",
    submit: "ओटीपी भेजें",
    submitting: "ओटीपी भेजा जा रहा है...",
    backToLogin: "लॉग इन पर वापस जाएं",
    createAccount: "खाता बनाएं",
    successTitle: "अपना इनबॉक्स देखें",
    fallback: (email) => `यदि ${email} के लिए खाता मौजूद है, तो हम वहां ओटीपी भेजेंगे।`,
    errorTitle: "ओटीपी भेजने में समस्या",
  } : {
    title: "Reset your password",
    subtitle: "Enter the email address linked to your account and we'll send you a 6-digit OTP.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    submit: "Send OTP",
    submitting: "Sending OTP...",
    backToLogin: "Back to login",
    createAccount: "Create an account",
    successTitle: "Check your inbox",
    fallback: (email) => `If an account exists for ${email}, we'll send an OTP there.`,
    errorTitle: "Failed to send OTP",
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(zodSendOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const { data: otpResponse } = await axios.post("/api/auth/reset-password/send-otp", data);
      if (!otpResponse.success) {
        throw new Error(otpResponse.message);
      }

      toastAlert(
        "success",
        copy.successTitle,
        translateAuthMessage(otpResponse.message || copy.fallback(data.email), language)
      );
      reset();
      router.push(`${WEBSITE_OTPVERIFY}?email=${encodeURIComponent(data.email.trim().toLowerCase())}`);
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
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                {copy.email}
              </label>
              <input
                id="email"
                type="email"
                placeholder={copy.emailPlaceholder}
                {...register("email")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              {errors.email ? <p className="text-sm text-destructive">{translateFieldError(errors.email.message, language)}</p> : null}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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
          </form>

          <div className="flex items-center justify-between gap-4 text-sm">
            <Link href={WEBSITE_LOGIN} className="text-muted-foreground transition hover:text-primary">
              {copy.backToLogin}
            </Link>
            <Link
              href={WEBSITE_REGISTER}
              className="font-medium text-primary transition hover:opacity-80"
            >
              {copy.createAccount}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
