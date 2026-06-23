"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodLoginSchema } from "@/lib/zodSchema";
import Logo from "@/public/assests/images/logo.webp";
import { WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from "@/routes/websiteRoutes";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "@/store/reducer/authReducer";
import { toastAlert } from "@/lib/toastAlert";
import { getPostLoginRoute } from "@/lib/authRedirect";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { translateAuthMessage, translateFieldError } from "@/lib/publicLanguage";

const LoginPage = () => {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const isLockedRedirect = searchParams.get("reason") === "locked";
  const copy = language === "hi" ? {
    title: "अपने खाते में लॉग इन करें",
    subtitle: "जारी रखने के लिए अपना ईमेल और पासवर्ड दर्ज करें।",
    locked: "आपका खाता लॉक है। कृपया अपने प्रशासक से संपर्क करें।",
    email: "ईमेल",
    emailPlaceholder: "you@example.com",
    password: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    hidePassword: "पासवर्ड छिपाएं",
    showPassword: "पासवर्ड दिखाएं",
    submitting: "लॉग इन हो रहा है...",
    submit: "लॉग इन करें",
    forgotPassword: "पासवर्ड भूल गए?",
    createAccount: "खाता बनाएं",
    loginFailed: "लॉग इन असफल",
  } : {
    title: "Log in to your account",
    subtitle: "Enter your email and password to continue.",
    locked: "Your account is locked. Please contact your administrator.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    submitting: "Logging in...",
    submit: "Log in",
    forgotPassword: "Forgot password?",
    createAccount: "Create an account",
    loginFailed: "Login failed",
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
    resolver: zodResolver(zodLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const { data: loginResponse } = await axios.post("/api/auth/login", data);
      if (!loginResponse.success) {
        throw new Error(loginResponse.message);
      }

      dispatch(login(loginResponse.data?.user ?? null));

      toastAlert(
        "success",
        language === "hi" ? "लॉग इन सफल" : "Login successful",
        translateAuthMessage(loginResponse.message, language)
      );

      const redirectTo = getPostLoginRoute({
        role: loginResponse.data?.user?.role,
        callback: searchParams.get("callback"),
      });

      router.replace(redirectTo);


    } catch (err) {
      toastAlert(
        "error",
        copy.loginFailed,
        translateAuthMessage(
          err.response?.data?.message || err.message || "Login failed. Please try again.",
          language
        )
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

          {isLockedRedirect ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {copy.locked}
            </div>
          ) : null}

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
              {errors.email ? (
                <p className="text-sm text-destructive">
                  {translateFieldError(errors.email.message, language)}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                {copy.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={copy.passwordPlaceholder}
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
                <p className="text-sm text-destructive">
                  {translateFieldError(errors.password.message, language)}
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
                {copy.forgotPassword}
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

export default LoginPage;
