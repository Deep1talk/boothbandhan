"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { zodRegisterSchema } from "@/lib/zodSchema";
import Logo from "@/public/assests/images/logo.webp";
import { WEBSITE_LOGIN } from "@/routes/websiteRoutes";
import { showErrorAlert, showSuccessAlert } from "@/lib/sweetAlert";
import axios from "axios";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";
import { translateAuthMessage, translateFieldError } from "@/lib/publicLanguage";


const RegisterPage = () => {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const copy = language === "hi" ? {
    title: "लीडर खाता बनाएं",
    subtitle: "पब्लिक रजिस्ट्रेशन से बिना पैरेंट वाला लीडर अकाउंट बनता है। डैशबोर्ड से बनाए गए उम्मीदवार और लीडर अपने पैरेंट अकाउंट से जुड़े रहेंगे।",
    name: "नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    email: "ईमेल",
    emailPlaceholder: "you@example.com",
    phone: "फोन नंबर",
    phonePlaceholder: "अपना फोन नंबर दर्ज करें",
    password: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "अपना पासवर्ड फिर से दर्ज करें",
    hidePassword: "पासवर्ड छिपाएं",
    showPassword: "पासवर्ड दिखाएं",
    submit: "लीडर खाता बनाएं",
    submitting: "लीडर खाता बनाया जा रहा है...",
    already: "क्या आपके पास पहले से खाता है?",
    login: "लॉग इन करें",
    successTitle: "पंजीकरण सफल",
    successText: (email) => `${email} पर सत्यापन ईमेल भेज दिया गया है। लॉग इन से पहले कृपया ईमेल सत्यापित करें।`,
    errorTitle: "पंजीकरण असफल",
  } : {
    title: "Create a leader account",
    subtitle: "Public registration creates leader accounts with no parent. Candidates and leaders created from a dashboard will still be linked to their parent account.",
    name: "Name",
    namePlaceholder: "Enter your full name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    phone: "Phone Number",
    phonePlaceholder: "Enter your phone number",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Enter your password",
    hidePassword: "Hide password",
    showPassword: "Show password",
    submit: "Create leader account",
    submitting: "Creating leader account...",
    already: "Already have an account?",
    login: "Log in",
    successTitle: "Registration successful",
    successText: (email) => `A verification email has been sent to ${email}. Please verify your email before login.`,
    errorTitle: "Registration failed",
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(zodRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const { data: regResponse } = await axios.post("/api/auth/register", data);
      if (!regResponse.success) {
        throw new Error(regResponse.message);
      }
      await showSuccessAlert(
        copy.successTitle,
        copy.successText(data.email)
      );
      reset();
    } catch (err) {
      await showErrorAlert(
        copy.errorTitle,
        translateAuthMessage(
          err.response?.data?.message || err.message || "Registration failed. Please try again.",
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

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                {copy.name}
              </label>
              <input
                id="name"
                type="text"
                placeholder={copy.namePlaceholder}
                {...register("name")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              {errors.name ? (
                <p className="text-sm text-destructive">
                  {translateFieldError(errors.name.message, language)}
                </p>
              ) : null}
            </div>

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
              <label className="text-sm font-medium" htmlFor="phone">
                {copy.phone}
              </label>
              <input
                id="phone"
                type="tel"
                placeholder={copy.phonePlaceholder}
                {...register("phone")}
                className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">
                  {translateFieldError(errors.phone.message, language)}
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
                <p className="text-sm text-destructive">
                  {translateFieldError(errors.confirmPassword.message, language)}
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
                href={WEBSITE_LOGIN}
                className="text-muted-foreground transition hover:text-primary"
              >
                {copy.already}
              </Link>
              <Link href={WEBSITE_LOGIN} className="font-medium text-primary transition hover:opacity-80">
                {copy.login}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
