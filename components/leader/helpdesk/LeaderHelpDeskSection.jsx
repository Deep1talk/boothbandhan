"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";
import { ClipboardList, LoaderCircle, RefreshCw, Send, Users } from "lucide-react";
import { HELP_DESK_ISSUE_OPTIONS } from "@/lib/helpDeskOptions";
import { helpDeskProblemSchema } from "@/lib/helpDeskValidation";
import { toastAlert } from "@/lib/toastAlert";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";

const DEFAULT_FAMILY_MEMBERS = Array.from({ length: 6 }, () => ({
  name: "",
  relation: "",
  age: "",
  gender: "",
  mobileNumber: "",
  educationOrOccupation: "",
}));
const INITIAL_FAMILY_MEMBER_ROWS = 1;

const DEFAULT_VALUES = {
  constituency: "",
  block: "",
  panchayat: "",
  wardNumber: "",
  wardInchargeName: "",
  wardInchargePhone: "",
  headOfFamilyName: "",
  fatherOrSpouseName: "",
  age: "",
  gender: "",
  casteCategory: "",
  mobileNumber: "",
  whatsappNumber: "",
  localAddress: "",
  totalFamilyMembers: "",
  familyMembers: DEFAULT_FAMILY_MEMBERS,
  issueCategories: [],
  issueDetails: "",
  verifierComment: "",
  wantsToJoinOrganization: "",
  declarationAccepted: false,
};

function buildDefaultValues(leader) {
  return {
    ...DEFAULT_VALUES,
    constituency: leader?.vidhansabha || "",
    block: leader?.block || "",
    panchayat: leader?.panchayat || "",
    wardNumber: leader?.ward || "",
    wardInchargeName: leader?.name || "",
    wardInchargePhone: leader?.phone || "",
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusPillClass(status) {
  if (status === "resolved") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (status === "in_review") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-slate-100 text-slate-900";
}

function normalizePayload(values) {
  return {
    ...values,
    familyMembers: (values.familyMembers || []).map((member) => ({
      ...member,
      age: member.age === "" ? "" : Number(member.age),
    })),
    age: values.age === "" ? "" : Number(values.age),
    totalFamilyMembers:
      values.totalFamilyMembers === "" ? "" : Number(values.totalFamilyMembers),
  };
}

export default function LeaderHelpDeskSection({ initialProblems = [], leader = null }) {
  const { language } = useLanguage();
  const t = (en, hi) => (language === "hi" ? hi : en);
  const [problems, setProblems] = useState(initialProblems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleFamilyRows, setVisibleFamilyRows] = useState(INITIAL_FAMILY_MEMBER_ROWS);
  const defaultValues = useMemo(() => buildDefaultValues(leader), [leader]);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(helpDeskProblemSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedIssueCategories =
    useWatch({ control, name: "issueCategories" }) || [];
  const issueLabelMap = useMemo(
    () =>
      HELP_DESK_ISSUE_OPTIONS.reduce((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {}),
    []
  );

  const refreshProblems = async () => {
    try {
      setIsRefreshing(true);
      const { data } = await axios.get("/api/help-desk/problems");
      setProblems(data.data?.problems ?? []);
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to refresh problems."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        "/api/help-desk/problems",
        normalizePayload(values)
      );

      setProblems((current) => [data.data.problem, ...current]);
      reset(defaultValues);
      setVisibleFamilyRows(INITIAL_FAMILY_MEMBER_ROWS);
      toastAlert("success", data.message || "Problem submitted successfully.");
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to submit problem."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <section className="rounded-[1.5rem] border border-emerald-200/70 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-950">
              Leader Help Desk
            </span>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
              Submit public problems from your area
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Fill the problem form using the Booth Bandhan reference. Submitted
              problems stay visible to admins, and you can also review your own
              entries below.
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 p-4 lg:max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-900">
              Submitted cases
            </p>
            <p className="mt-2 text-3xl font-semibold text-emerald-950">
              {problems.length}
            </p>
            <p className="mt-2 text-sm text-emerald-900/80">
              Each complaint is saved separately in the new backend collection.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <div className="rounded-2xl bg-emerald-700 px-4 py-3 text-white">
              <h3 className="text-base font-semibold">
                Area details and ward contact
              </h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t("Vidhan Sabha / Constituency", "विधान सभा / निर्वाचन क्षेत्र")} required error={errors.constituency?.message}>
                <input {...register("constituency")} className={inputClassName} />
              </Field>
              <Field label={t("Block", "ब्लॉक")} required error={errors.block?.message}>
                <input {...register("block")} className={inputClassName} />
              </Field>
              <Field label={t("Gram Panchayat", "ग्राम पंचायत")} required error={errors.panchayat?.message}>
                <input {...register("panchayat")} className={inputClassName} />
              </Field>
              <Field label={t("Ward Number", "वार्ड नंबर")} required error={errors.wardNumber?.message}>
                <input {...register("wardNumber")} className={inputClassName} />
              </Field>
              <Field label={t("Ward Incharge Name", "वार्ड प्रभारी का नाम")} error={errors.wardInchargeName?.message}>
                <input {...register("wardInchargeName")} className={inputClassName} />
              </Field>
              <Field label={t("Ward Incharge Mobile", "वार्ड प्रभारी मोबाइल")} error={errors.wardInchargePhone?.message}>
                <input {...register("wardInchargePhone")} className={inputClassName} />
              </Field>
            </div>
          </section>

          <section>
            <div className="rounded-2xl bg-emerald-700 px-4 py-3 text-white">
              <h3 className="text-base font-semibold">
                Head of family / complainant details
              </h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t("Head of Family Name", "परिवार प्रमुख का नाम")} required error={errors.headOfFamilyName?.message}>
                <input
                  {...register("headOfFamilyName", { required: true })}
                  className={inputClassName}
                />
              </Field>
              <Field label={t("Father / Husband Name", "पिता / पति का नाम")} error={errors.fatherOrSpouseName?.message}>
                <input {...register("fatherOrSpouseName")} className={inputClassName} />
              </Field>
              <Field label={t("Age", "आयु")} required error={errors.age?.message}>
                <input type="number" min="0" {...register("age")} className={inputClassName} />
              </Field>
              <Field label={t("Gender", "लिंग")} required error={errors.gender?.message}>
                <select {...register("gender")} className={inputClassName}>
                  <option value="">{t("Select", "चुनें")}</option>
                  <option value="Male">{t("Male", "पुरुष")}</option>
                  <option value="Female">{t("Female", "महिला")}</option>
                  <option value="Other">{t("Other", "अन्य")}</option>
                </select>
              </Field>
              <Field label={t("Caste / Category", "जाति / श्रेणी")} error={errors.casteCategory?.message}>
                <input {...register("casteCategory")} className={inputClassName} />
              </Field>
              <Field label={t("Mobile Number", "मोबाइल नंबर")} required error={errors.mobileNumber?.message}>
                <input {...register("mobileNumber")} className={inputClassName} />
              </Field>
              <Field label={t("WhatsApp Number", "व्हाट्सऐप नंबर")} required error={errors.whatsappNumber?.message}>
                <input {...register("whatsappNumber")} className={inputClassName} />
              </Field>
              <Field label={t("Total Family Members", "कुल परिवार सदस्य")} required error={errors.totalFamilyMembers?.message}>
                <input
                  type="number"
                  min="0"
                  {...register("totalFamilyMembers")}
                  className={inputClassName}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label={t("Local Address / Tola", "स्थानीय पता / टोला")} required error={errors.localAddress?.message}>
                  <textarea
                    rows={3}
                    {...register("localAddress")}
                    className={`${inputClassName} resize-y`}
                  />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-2xl bg-emerald-700 px-4 py-3 text-white">
              <h3 className="text-base font-semibold">
                Family members details
              </h3>
            </div>
            <div className="mt-4 space-y-3 md:hidden">
              {DEFAULT_FAMILY_MEMBERS.slice(0, visibleFamilyRows).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Family member {index + 1}
                  </p>
                  <div className="mt-3 grid gap-3">
                    <Field label={t("Name", "नाम")}>
                      <input
                        {...register(`familyMembers.${index}.name`)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label={t("Relation", "रिश्ता")}>
                      <input
                        {...register(`familyMembers.${index}.relation`)}
                        className={inputClassName}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label={t("Age", "आयु")}>
                        <input
                          type="number"
                          min="0"
                          {...register(`familyMembers.${index}.age`)}
                          className={inputClassName}
                        />
                      </Field>
                      <Field label={t("Gender", "लिंग")}>
                        <input
                          {...register(`familyMembers.${index}.gender`)}
                          className={inputClassName}
                        />
                      </Field>
                    </div>
                    <Field label={t("Mobile", "मोबाइल")}>
                      <input
                        {...register(`familyMembers.${index}.mobileNumber`)}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label={t("Education / Occupation", "शिक्षा / व्यवसाय")}>
                      <input
                        {...register(`familyMembers.${index}.educationOrOccupation`)}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 hidden overflow-x-auto rounded-2xl border border-border/60 md:block">
              <table className="min-w-full divide-y divide-border/60 text-sm">
                <thead className="bg-emerald-50/80 text-emerald-950">
                  <tr>
                    {["#", "Name", "Relation", "Age", "Gender", "Mobile", "Education / Occupation"].map((label) => (
                      <th key={label} className="px-3 py-3 text-left font-semibold">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-white">
                  {DEFAULT_FAMILY_MEMBERS.slice(0, visibleFamilyRows).map((_, index) => (
                    <tr key={index}>
                      <td className="px-3 py-3 font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`familyMembers.${index}.name`)}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`familyMembers.${index}.relation`)}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          {...register(`familyMembers.${index}.age`)}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`familyMembers.${index}.gender`)}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`familyMembers.${index}.mobileNumber`)}
                          className={tableInputClassName}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          {...register(`familyMembers.${index}.educationOrOccupation`)}
                          className={tableInputClassName}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setVisibleFamilyRows((current) =>
                    Math.min(DEFAULT_FAMILY_MEMBERS.length, current + 1)
                  )
                }
                disabled={visibleFamilyRows >= DEFAULT_FAMILY_MEMBERS.length}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("Add more row", "एक और पंक्ति जोड़ें")}
              </button>
              <button
                type="button"
                onClick={() =>
                  setVisibleFamilyRows((current) =>
                    Math.max(INITIAL_FAMILY_MEMBER_ROWS, current - 1)
                  )
                }
                disabled={visibleFamilyRows <= INITIAL_FAMILY_MEMBER_ROWS}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("Remove row", "पंक्ति हटाएं")}
              </button>
            </div>
            {errors.familyMembers?.message ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.familyMembers.message}
              </p>
            ) : null}
          </section>

          <section>
            <div className="rounded-2xl bg-emerald-700 px-4 py-3 text-white">
              <h3 className="text-base font-semibold">
                Main problems in the ward / family
              </h3>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {HELP_DESK_ISSUE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`rounded-2xl border p-4 transition ${
                    selectedIssueCategories.includes(option.value)
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-border/60 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      value={option.value}
                      {...register("issueCategories")}
                      className="mt-1 size-4 rounded border-border/70 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {option.hint}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.issueCategories?.message ? (
              <p className="mt-2 text-sm text-rose-600">
                {errors.issueCategories.message}
              </p>
            ) : null}
          </section>

          <section>
            <div className="rounded-2xl bg-emerald-700 px-4 py-3 text-white">
              <h3 className="text-base font-semibold">
                Detailed problem description and remarks
              </h3>
            </div>
            <div className="mt-4 grid gap-4">
              <Field label={t("Detailed Problem / Special Demand", "विस्तृत समस्या / विशेष मांग")} required error={errors.issueDetails?.message}>
                <textarea
                  rows={6}
                  {...register("issueDetails", { required: true })}
                  className={`${inputClassName} resize-y`}
                />
              </Field>
              <Field label={t("Is this family interested in joining the organization?", "क्या यह परिवार संगठन से जुड़ना चाहता है?")}>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: t("Yes", "हाँ"), value: "yes" },
                    { label: t("No", "नहीं"), value: "no" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm text-foreground"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register("wantsToJoinOrganization")}
                        className="size-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </section>

          <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="rounded-2xl border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-950">
              <p>
                <span className="font-semibold">घोषणा:</span> मैं यह प्रमाणित करता हूँ कि ऊपर दी गई सभी जानकारी
                पूरी तरह सही है और मैं स्वेच्छा से, पूर्ण सहमति के साथ अपनी यह सभी आवश्यक जानकारी Booth
                Bandhan Private Limited के साथ साझा कर रहा हूँ।
              </p>
            </div>
            <label className="flex items-start gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                {...register("declarationAccepted")}
                className="mt-1 size-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                मैंने ऊपर दी गई घोषणा पढ़ ली है और मैं इससे सहमत हूँ।
                <span className="ml-1 text-rose-600">*</span>
              </span>
            </label>
            {errors.declarationAccepted ? (
              <p className="text-sm text-rose-600">
                {errors.declarationAccepted.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Problems are visible only to admins from leader cards.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Submit problem
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.5rem] border border-border/60 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Submitted problems
            </p>
            <h3 className="mt-2 text-xl font-semibold text-foreground">
              Your latest help desk entries
            </h3>
          </div>

          <button
            type="button"
            onClick={refreshProblems}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRefreshing ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {problems.length ? (
            problems.map((problem) => (
              <article
                key={problem.id}
                className="rounded-[1.2rem] border border-border/60 bg-emerald-50/30 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-950">
                        <ClipboardList className="size-3.5" />
                        Help Desk
                      </span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${statusPillClass(
                          problem.status
                        )}`}
                      >
                        {problem.status.replaceAll("_", " ")}
                      </span>
                      {problem.totalFamilyMembers ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-muted-foreground">
                          <Users className="size-3.5" />
                          {problem.totalFamilyMembers} family members
                        </span>
                      ) : null}
                    </div>

                    <h4 className="mt-3 text-lg font-semibold text-foreground">
                      {problem.headOfFamilyName}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {problem.mobileNumber}
                      {problem.localAddress ? ` • ${problem.localAddress}` : ""}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {problem.issueCategories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-emerald-900"
                        >
                          {issueLabelMap[category] || category}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-foreground/90">
                      {problem.issueDetails}
                    </p>

                    {problem.verifierComment ? (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-white/90 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900">
                          Verifier comment
                        </p>
                        <p className="mt-2 text-sm leading-6 text-foreground/90">
                          {problem.verifierComment}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="text-sm text-muted-foreground lg:text-right">
                    <p>{formatDate(problem.createdAt)}</p>
                    {problem.wardNumber || problem.panchayat || problem.block ? (
                      <p className="mt-2">
                        {[problem.wardNumber, problem.panchayat, problem.block]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-sm text-muted-foreground">
              No problems submitted yet. Use the form above to create your first help desk entry.
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

function Field({ label, required = false, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </span>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

const tableInputClassName =
  "h-10 w-full rounded-lg border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";
