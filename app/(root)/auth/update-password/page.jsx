"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Logo from "@/public/assests/images/logo.webp";
import { zodResetPasswordSchema } from "@/lib/zodSchema";
import { WEBSITE_LOGIN, WEBSITE_REGISTER } from "@/routes/websiteRoutes";
import { toastAlert } from "@/lib/toastAlert";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { translateAuthMessage, translateFieldError } from "@/lib/publicLanguage";

const UpdatePasswordPage = () => {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() || "";
  const copy = language === "hi" ? {
    title: "अपना पासवर्ड अपडेट करें",
    subtitle: "अपने खाते के लिए नया पासवर्ड दर्ज करें।",
    updatingFor: "जिस ईमेल के लिए पासवर्ड अपडेट हो रहा है:",
    newPassword: "नया पासवर्ड",
    newPasswordPlaceholder: "अपना नया पासवर्ड दर्ज करें",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "अपना नया पासवर्ड फिर से दर्ज करें",
    hidePassword: "पासवर्ड छिपाएं",
    showPassword: "पासवर्ड दिखाएं",
    submitting: "पासवर्ड अपडेट हो रहा है...",
    submit: "पासवर्ड अपडेट करें",
    backToLogin: "लॉग इन पर वापस जाएं",
    createAccount: "खाता बनाएं",
    missingEmail: "रीसेट ईमेल नहीं मिला। कृपया पासवर्ड रीसेट प्रक्रिया दोबारा शुरू करें।",
    successTitle: "पासवर्ड अपडेट हो गया",
    errorTitle: "पासवर्ड अपडेट असफल",
  } : {
    title: "Update your password",
    subtitle: "Enter a new password for your account.",
    updatingFor: "Updating password for",
    newPassword: "New Password",
    newPasswordPlaceholder: "Enter your new password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your new password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    submitting: "Updating password...",
    submit: "Update password",
    backToLogin: "Back to login",
    createAccount: "Create an account",
    missingEmail: "Reset email is missing. Please restart the reset password flow.",
    successTitle: "Password updated",
    errorTitle: "Password update failed",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      if (!email) {
        throw new Error(copy.missingEmail);
      }

      const { data: updatePasswordResponse } = await axios.put("/api/auth/reset-password/change-password", {
        email,
        password: data.password,
      });

      if (!updatePasswordResponse.success) {
        throw new Error(updatePasswordResponse.message);
      }

      toastAlert("success", copy.successTitle, translateAuthMessage(updatePasswordResponse.message, language));
      reset({
        password: "",
        confirmPassword: "",
      });
      router.push(WEBSITE_LOGIN);
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
            {email ? <p className="text-xs text-muted-foreground">{copy.updatingFor} {email}</p> : null}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                {copy.newPassword}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={copy.newPasswordPlaceholder}
                  {...register("password")}
                  className="flex h-11 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                />
                <button
                  type="button"
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-sm text-destructive">{translateFieldError(errors.password.message, language)}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirmPassword">
                {copy.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder={copy.confirmPasswordPlaceholder}
                {...register("confirmPassword")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-destructive">{translateFieldError(errors.confirmPassword.message, language)}</p>
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
                href={WEBSITE_LOGIN}
                className="text-muted-foreground transition hover:text-primary"
              >
                {copy.backToLogin}
              </Link>
              <Link
                href={WEBSITE_REGISTER}
                className="font-medium text-primary transition hover:opacity-80"
              >
                {copy.createAccount}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
