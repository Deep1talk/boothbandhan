"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle2, CircleDollarSign, Eye, EyeOff, ImagePlus, LoaderCircle, Lock } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BIHAR_DISTRICTS,
  BLOOD_GROUP_OPTIONS,
  CASTE_CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  getVidhansabhaOptions,
  RELIGION_OPTIONS,
  YES_NO_OPTIONS,
} from "@/lib/leaderRegistration";
import { showSuccessAlert } from "@/lib/sweetAlert";
import { zodCreateLeaderSchema, zodCreateManagedUserSchema } from "@/lib/zodSchema";
import { toastAlert } from "@/lib/toastAlert";
import { useLanguage } from "@/components/shared/providers/LanguageProvider";

const FORM_TRANSLATIONS = {
  hi: {
    "Leader registration": "लीडर पंजीकरण",
    "Managed creation": "प्रबंधित निर्माण",
    "1. Personal and Contact Details": "1. व्यक्तिगत और संपर्क विवरण",
    "2. Area Details": "2. क्षेत्र विवरण",
    "3. Political and Social Background": "3. राजनीतिक और सामाजिक पृष्ठभूमि",
    "4. Ward Planning and Resources": "4. वार्ड योजना और संसाधन",
    "Full Name": "पूरा नाम",
    "Enter full name": "पूरा नाम दर्ज करें",
    "Father's / Husband's Name": "पिता / पति का नाम",
    "Enter father or husband name": "पिता या पति का नाम दर्ज करें",
    Age: "आयु",
    "Enter age": "आयु दर्ज करें",
    Gender: "लिंग",
    "Select gender": "लिंग चुनें",
    "Caste Category": "जाति श्रेणी",
    "Select caste category": "जाति श्रेणी चुनें",
    Religion: "धर्म",
    "Select religion": "धर्म चुनें",
    "Mobile Number": "मोबाइल नंबर",
    "Enter 10 digit mobile number": "10 अंकों का मोबाइल नंबर दर्ज करें",
    "WhatsApp Number": "व्हाट्सऐप नंबर",
    "Enter 10 digit WhatsApp number": "10 अंकों का व्हाट्सऐप नंबर दर्ज करें",
    Email: "ईमेल",
    "Full Address": "पूरा पता",
    "Village / Mohalla / street / address": "Village / Mohalla / Street / Address / Pincode",
    Ward: "वार्ड",
    "Enter ward name / number": "वार्ड नाम / नंबर दर्ज करें",
    Panchayat: "पंचायत",
    "Enter panchayat": "पंचायत दर्ज करें",
    Block: "ब्लॉक",
    "Enter block": "ब्लॉक दर्ज करें",
    District: "जिला",
    "Select district": "जिला चुनें",
    "Assembly Constituency": "विधानसभा क्षेत्र",
    "Select vidhansabha": "विधानसभा चुनें",
    "Select district first": "पहले जिला चुनें",
    "Current Party": "वर्तमान पार्टी",
    "Enter current party": "वर्तमान पार्टी दर्ज करें",
    Position: "पद",
    "Enter role / position": "भूमिका / पद दर्ज करें",
    "Contested Election Before": "पहले चुनाव लड़ा है",
    "Select option": "विकल्प चुनें",
    "Political Experience (Years)": "राजनीतिक अनुभव (वर्ष)",
    "Enter years": "वर्ष दर्ज करें",
    "Primary Social Group": "मुख्य सामाजिक समूह",
    "Kisan / youth / women etc.": "किसान / युवा / महिला आदि",
    "Number of Active Workers": "सक्रिय कार्यकर्ताओं की संख्या",
    "Enter worker count": "कार्यकर्ता संख्या दर्ज करें",
    "Total Voters": "कुल मतदाता",
    "Enter total voter count": "कुल मतदाता संख्या दर्ज करें",
    "Worker Available for Every 10 Houses": "हर 10 घर पर कार्यकर्ता उपलब्ध",
    "Digital Campaigning": "डिजिटल कैंपेनिंग",
    "Financial Preparedness": "वित्तीय तैयारी",
    "Major Issues in the Area": "क्षेत्र की प्रमुख समस्याएं",
    "Enter first key issue": "पहली प्रमुख समस्या दर्ज करें",
    "Enter second key issue": "दूसरी प्रमुख समस्या दर्ज करें",
    "Enter third key issue": "तीसरी प्रमुख समस्या दर्ज करें",
    Date: "तारीख",
    Place: "स्थान",
    "Enter place": "स्थान दर्ज करें",
    "Signature Name": "हस्ताक्षर नाम",
    "Enter signatory name": "हस्ताक्षर नाम दर्ज करें",
    Name: "नाम",
    "Phone Number": "फोन नंबर",
    "Enter phone number": "फोन नंबर दर्ज करें",
    Password: "पासवर्ड",
    "Enter password": "पासवर्ड दर्ज करें",
    "Hide password": "पासवर्ड छिपाएं",
    "Show password": "पासवर्ड दिखाएं",
    "Confirm Password": "पासवर्ड की पुष्टि करें",
    "Confirm password": "पासवर्ड की पुष्टि करें",
    "The leader confirms the information is true and complete.": "लीडर पुष्टि करता/करती है कि दी गई जानकारी सत्य और पूर्ण है।",
    Creating: "बनाया जा रहा है...",
    "Registration created": "पंजीकरण बन गया",
    "Choose payment status for": "के लिए भुगतान स्थिति चुनें",
    "Select `Paid` to collect ₹100 through Razorpay, or `Unpaid` to keep this leader locked.": "Razorpay के माध्यम से ₹100 लेने के लिए `Paid` चुनें, या इस लीडर को लॉक रखने के लिए `Unpaid` चुनें।",
    "Mark Unpaid": "अवैतनिक चिह्नित करें",
    "Pay ₹100": "₹100 भुगतान करें",
    "Leader account has been created.": "लीडर खाता बन गया है।",
    "Until payment is completed, this leader stays locked with pending payment status.": "भुगतान पूरा होने तक यह लीडर लंबित भुगतान स्थिति के साथ लॉक रहेगा।",
    "Create Field Associate": "फील्ड एसोसिएट बनाएं",
    "Create Candidate": "उम्मीदवार बनाएं",
    "Create Leader": "लीडर बनाएं",
    "Register Leader": "लीडर पंजीकरण",
    "New field associates link to your account automatically.": "नए फील्ड एसोसिएट अपने आप आपके खाते से जुड़ेंगे।",
    "New candidates link to your account automatically.": "नए उम्मीदवार अपने आप आपके खाते से जुड़ेंगे।",
    "New leaders link to your account automatically.": "नए लीडर अपने आप आपके खाते से जुड़ेंगे।",
    "Create a leader account with full personal, area, and political details linked to your field associate profile.": "अपने फील्ड एसोसिएट प्रोफाइल से जुड़े पूर्ण व्यक्तिगत, क्षेत्रीय और राजनीतिक विवरणों के साथ लीडर खाता बनाएं।",
    "Create a leader account with full personal, area, and political details linked to your candidate profile.": "अपने उम्मीदवार प्रोफाइल से जुड़े पूर्ण व्यक्तिगत, क्षेत्रीय और राजनीतिक विवरणों के साथ लीडर खाता बनाएं।",
  },
  en: {},
};

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function TextField({
  id,
  label,
  error,
  register,
  name,
  type = "text",
  placeholder,
  className = "",
  required = false,
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        required={required}
        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
      />
      <FieldError message={error?.message} />
    </div>
  );
}

function SelectField({
  id,
  label,
  error,
  register,
  name,
  placeholder,
  options,
  className = "",
  required = false,
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </label>
      <select
        id={id}
        {...register(name)}
        required={required}
        className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError message={error?.message} />
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="md:col-span-2">
      <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
        {title}
      </div>
    </div>
  );
}

function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CreateManagedUserForm({
  title,
  description,
  submitLabel,
  accentClass = "from-amber-50 via-white to-orange-50",
  submitButtonClass = "bg-primary text-primary-foreground hover:bg-primary/90",
  onSuccess,
  sectionId,
  variant = "managed",
}) {
  const { language } = useLanguage();
  const t = (value) => FORM_TRANSLATIONS[language]?.[value] || value;
  const isLeaderForm = variant === "leader";
  const [showPassword, setShowPassword] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState(null);
  const [isPaymentBusy, setIsPaymentBusy] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isLeaderForm ? zodCreateLeaderSchema : zodCreateManagedUserSchema),
    defaultValues: isLeaderForm
      ? {
          name: "",
          fatherName: "",
          age: "",
          gender: "",
          casteCategory: "",
          religion: "",
          phone: "",
          whatsappNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
          fullAddress: "",
          ward: "",
          panchayat: "",
          block: "",
          district: "",
          vidhansabha: "",
          currentParty: "",
          politicalPosition: "",
          hasContestedElection: "",
          experienceYears: "",
          mainSupportBase: "",
          activeWorkerCount: "",
          totalVoters: "",
          hasTenHouseWorkers: "",
          digitalCampaign: "",
          financialPreparedness: "",
          topIssue1: "",
          topIssue2: "",
          topIssue3: "",
          declarationAccepted: false,
          registrationDate: "",
          registrationPlace: "",
          signatureName: "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          idNo: "",
          bloodGroup: "",
          fullAddress: "",
          block: "",
          district: "",
          vidhansabha: "",
          password: "",
          confirmPassword: "",
        },
  });
  const selectedDistrict = useWatch({ control, name: "district" });
  const selectedVidhansabha = useWatch({ control, name: "vidhansabha" });
  const vidhansabhaOptions = useMemo(
    () => getVidhansabhaOptions(selectedDistrict),
    [selectedDistrict]
  );
  const profileImagePreviewUrl = useMemo(
    () => (profileImageFile ? URL.createObjectURL(profileImageFile) : ""),
    [profileImageFile]
  );

  useEffect(() => {
    if (!selectedDistrict) {
      return;
    }

    if (selectedVidhansabha && !vidhansabhaOptions.includes(selectedVidhansabha)) {
      setValue("vidhansabha", "");
    }
  }, [selectedDistrict, selectedVidhansabha, setValue, vidhansabhaOptions]);

  useEffect(() => {
    return () => {
      if (profileImagePreviewUrl) {
        URL.revokeObjectURL(profileImagePreviewUrl);
      }
    };
  }, [profileImagePreviewUrl]);

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setProfileImageFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      toastAlert("error", "Invalid image", "Please choose an image file for the profile picture.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      toastAlert("error", "Image too large", "Profile picture must be 2MB or smaller.");
      return;
    }

    setProfileImageFile(file);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        formData.append(key, typeof value === "boolean" ? String(value) : value);
      });

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const { data: response } = await axios.post("/api/users/create", formData);
      if (!response.success) {
        throw new Error(response.message);
      }

      await showSuccessAlert(
        response.message || "User created successfully",
        `A verification email has been sent to ${response.data?.user?.email || data.email}. Please verify the email before login.`
      );
      reset();
      setProfileImageFile(null);
      setProfileImageInputKey((current) => current + 1);
      if (isLeaderForm) {
        setPaymentChoice(response.data?.user ?? null);
      }
      onSuccess?.(response.data?.user ?? null);
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to create user."
      );
    }
  };

  const handleMarkUnpaid = async () => {
    if (!paymentChoice?.id) {
      return;
    }

    try {
      setIsPaymentBusy(true);
      const { data: response } = await axios.post(
        `/api/users/${paymentChoice.id}/registration-payment/unpaid`
      );
      toastAlert("success", response.message || "Leader marked unpaid.");
      setPaymentChoice(null);
      onSuccess?.(response.data?.user ?? paymentChoice);
    } catch (error) {
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to update payment status."
      );
    } finally {
      setIsPaymentBusy(false);
    }
  };

  const handlePaidPayment = async () => {
    if (!paymentChoice?.id) {
      return;
    }

    try {
      setIsPaymentBusy(true);
      const isLoaded = await loadRazorpayCheckout();

      if (!isLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const { data: orderResponse } = await axios.post(
        `/api/users/${paymentChoice.id}/registration-payment/order`
      );

      const orderData = orderResponse.data;
      const razorpay = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Booth Bandhan",
        description: "Leader registration fee",
        order_id: orderData.order.id,
        prefill: {
          name: orderData.leader.name,
          email: orderData.leader.email,
          contact: orderData.leader.phone,
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (paymentResult) => {
          try {
            const { data: confirmResponse } = await axios.post(
              `/api/users/${paymentChoice.id}/registration-payment/confirm`,
              paymentResult
            );
            toastAlert("success", confirmResponse.message || "Payment successful.");
            setPaymentChoice(null);
            onSuccess?.(confirmResponse.data?.user ?? paymentChoice);
          } catch (error) {
            toastAlert(
              "error",
              error.response?.data?.message || error.message || "Payment verification failed."
            );
          } finally {
            setIsPaymentBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaymentBusy(false);
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setIsPaymentBusy(false);
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to start payment."
      );
    }
  };

  return (
    <section id={sectionId} className={`overflow-hidden rounded-[1.5rem] border border-border/60 bg-gradient-to-br ${accentClass} p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:rounded-[1.75rem] sm:p-6`}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {t(isLeaderForm ? "Leader registration" : "Managed creation")}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t(title)}</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{t(description)}</p>
      </div>

      <form className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 md:gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {isLeaderForm ? (
          <>
            <SectionHeading title={t("1. Personal and Contact Details")} />
            <TextField
              id={`${submitLabel}-name`}
              label={t("Full Name")}
              name="name"
              placeholder={t("Enter full name")}
              register={register}
              error={errors.name}
              required
            />
            <TextField
              id={`${submitLabel}-fatherName`}
              label={t("Father's / Husband's Name")}
              name="fatherName"
              placeholder={t("Enter father or husband name")}
              register={register}
              error={errors.fatherName}
              required
            />
            <TextField
              id={`${submitLabel}-age`}
              label={t("Age")}
              name="age"
              type="number"
              placeholder={t("Enter age")}
              register={register}
              error={errors.age}
              required
            />
            <SelectField
              id={`${submitLabel}-gender`}
              label={t("Gender")}
              name="gender"
              placeholder={t("Select gender")}
              options={GENDER_OPTIONS}
              register={register}
              error={errors.gender}
              required
            />
            <SelectField
              id={`${submitLabel}-casteCategory`}
              label={t("Caste Category")}
              name="casteCategory"
              placeholder={t("Select caste category")}
              options={CASTE_CATEGORY_OPTIONS}
              register={register}
              error={errors.casteCategory}
              required
            />
            <SelectField
              id={`${submitLabel}-religion`}
              label={t("Religion")}
              name="religion"
              placeholder={t("Select religion")}
              options={RELIGION_OPTIONS}
              register={register}
              error={errors.religion}
              required
            />
            <TextField
              id={`${submitLabel}-phone`}
              label={t("Mobile Number")}
              name="phone"
              type="tel"
              placeholder={t("Enter 10 digit mobile number")}
              register={register}
              error={errors.phone}
              required
            />
            <TextField
              id={`${submitLabel}-whatsappNumber`}
              label={t("WhatsApp Number")}
              name="whatsappNumber"
              type="tel"
              placeholder={t("Enter 10 digit WhatsApp number")}
              register={register}
              error={errors.whatsappNumber}
              required
            />
            <TextField
              id={`${submitLabel}-email`}
              label={t("Email")}
              name="email"
              type="email"
              placeholder="leader@example.com"
              register={register}
              error={errors.email}
              className="md:col-span-2"
              required
            />

            <SectionHeading title={t("2. Area Details")} />
            <TextField
              id={`${submitLabel}-fullAddress`}
              label={t("Full Address")}
              name="fullAddress"
              placeholder={t("Village / Mohalla / street / address")}
              register={register}
              error={errors.fullAddress}
              className="md:col-span-2"
              required
            />
            <TextField
              id={`${submitLabel}-ward`}
              label={t("Ward")}
              name="ward"
              placeholder={t("Enter ward name / number")}
              register={register}
              error={errors.ward}
              required
            />
            <TextField
              id={`${submitLabel}-panchayat`}
              label={t("Panchayat")}
              name="panchayat"
              placeholder={t("Enter panchayat")}
              register={register}
              error={errors.panchayat}
              required
            />
            <TextField
              id={`${submitLabel}-block`}
              label={t("Block")}
              name="block"
              placeholder={t("Enter block")}
              register={register}
              error={errors.block}
              required
            />
            <SelectField
              id={`${submitLabel}-district`}
              label={t("District")}
              name="district"
              placeholder={t("Select district")}
              options={BIHAR_DISTRICTS}
              register={register}
              error={errors.district}
              required
            />
            <SelectField
              id={`${submitLabel}-vidhansabha`}
              label={t("Assembly Constituency")}
              name="vidhansabha"
              placeholder={selectedDistrict ? t("Select vidhansabha") : t("Select district first")}
              options={vidhansabhaOptions}
              register={register}
              error={errors.vidhansabha}
              required
            />

            <SectionHeading title={t("3. Political and Social Background")} />
            <TextField
              id={`${submitLabel}-currentParty`}
              label={t("Current Party")}
              name="currentParty"
              placeholder={t("Enter current party")}
              register={register}
              error={errors.currentParty}
            />
            <TextField
              id={`${submitLabel}-politicalPosition`}
              label={t("Position")}
              name="politicalPosition"
              placeholder={t("Enter role / position")}
              register={register}
              error={errors.politicalPosition}
            />
            <SelectField
              id={`${submitLabel}-hasContestedElection`}
              label={t("Contested Election Before")}
              name="hasContestedElection"
              placeholder={t("Select option")}
              options={YES_NO_OPTIONS}
              register={register}
              error={errors.hasContestedElection}
              required
            />
            <TextField
              id={`${submitLabel}-experienceYears`}
              label={t("Political Experience (Years)")}
              name="experienceYears"
              type="number"
              placeholder={t("Enter years")}
              register={register}
              error={errors.experienceYears}
              required
            />
            <TextField
              id={`${submitLabel}-mainSupportBase`}
              label={t("Primary Social Group")}
              name="mainSupportBase"
              placeholder={t("Kisan / youth / women etc.")}
              register={register}
              error={errors.mainSupportBase}
              required
            />
            <TextField
              id={`${submitLabel}-activeWorkerCount`}
              label={t("Number of Active Workers")}
              name="activeWorkerCount"
              type="number"
              placeholder={t("Enter worker count")}
              register={register}
              error={errors.activeWorkerCount}
              required
            />

            <SectionHeading title={t("4. Ward Planning and Resources")} />
            <TextField
              id={`${submitLabel}-totalVoters`}
              label={t("Total Voters")}
              name="totalVoters"
              type="number"
              placeholder={t("Enter total voter count")}
              register={register}
              error={errors.totalVoters}
              required
            />
            <SelectField
              id={`${submitLabel}-hasTenHouseWorkers`}
              label={t("Worker Available for Every 10 Houses")}
              name="hasTenHouseWorkers"
              placeholder={t("Select option")}
              options={YES_NO_OPTIONS}
              register={register}
              error={errors.hasTenHouseWorkers}
              required
            />
            <SelectField
              id={`${submitLabel}-digitalCampaign`}
              label={t("Digital Campaigning")}
              name="digitalCampaign"
              placeholder={t("Select option")}
              options={YES_NO_OPTIONS}
              register={register}
              error={errors.digitalCampaign}
              required
            />
            <SelectField
              id={`${submitLabel}-financialPreparedness`}
              label={t("Financial Preparedness")}
              name="financialPreparedness"
              placeholder={t("Select option")}
              options={YES_NO_OPTIONS}
              register={register}
              error={errors.financialPreparedness}
              required
            />
            <TextField
              id={`${submitLabel}-topIssue1`}
              label={t("Major Issues in the Area")}
              name="topIssue1"
              placeholder={t("Enter first key issue")}
              register={register}
              error={errors.topIssue1}
              className="md:col-span-2"
            />
            <TextField
              id={`${submitLabel}-topIssue2`}
              label={t("Major Issues in the Area")}
              name="topIssue2"
              placeholder={t("Enter second key issue")}
              register={register}
              error={errors.topIssue2}
              className="md:col-span-2"
            />
            <TextField
              id={`${submitLabel}-topIssue3`}
              label={t("Major Issues in the Area")}
              name="topIssue3"
              placeholder={t("Enter third key issue")}
              register={register}
              error={errors.topIssue3}
              className="md:col-span-2"
            />

            <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-4 md:col-span-2">
              <label className="flex items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  {...register("declarationAccepted")}
                  className="mt-1 size-4 rounded border-border text-primary focus:ring-ring"
                />
                <span>
                  {t("The leader confirms the information is true and complete.")}
                  <span className="ml-1 text-destructive">*</span>
                </span>
              </label>
              <FieldError message={errors.declarationAccepted?.message} />

              <div className="rounded-2xl border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-950">
                <p>
                  <span className="font-semibold">घोषणा:</span> मैं बूथ बंधन प्राइवेट लिमिटेड
                  की कार्यप्रणाली और विजन से अत्यधिक प्रभावित होकर, बिना किसी दबाव के अपनी
                  स्वेच्छा से ₹100 का पंजीकरण शुल्क (Registration Fee) जमा कर रहा हूँ। मैं यह
                  घोषणा करता हूँ कि मेरे द्वारा साझा की गई सभी जानकारियाँ और दस्तावेज पूर्णतः
                  सत्य और प्रमाणित हैं।
                </p>
              </div>
            </div>

            <TextField
              id={`${submitLabel}-registrationDate`}
              label={t("Date")}
              name="registrationDate"
              type="date"
              register={register}
              error={errors.registrationDate}
              required
            />
            <TextField
              id={`${submitLabel}-registrationPlace`}
              label={t("Place")}
              name="registrationPlace"
              placeholder={t("Enter place")}
              register={register}
              error={errors.registrationPlace}
            />
            <TextField
              id={`${submitLabel}-signatureName`}
              label={t("Signature Name")}
              name="signatureName"
              placeholder={t("Enter signatory name")}
              register={register}
              error={errors.signatureName}
            />
          </>
        ) : (
          <>
            <TextField
              id={`${submitLabel}-name`}
              label={t("Name")}
              name="name"
              placeholder={t("Enter full name")}
              register={register}
              error={errors.name}
              required
            />
            <TextField
              id={`${submitLabel}-email`}
              label={t("Email")}
              name="email"
              type="email"
              placeholder="you@example.com"
              register={register}
              error={errors.email}
              required
            />
            <TextField
              id={`${submitLabel}-phone`}
              label={t("Phone Number")}
              name="phone"
              type="tel"
              placeholder={t("Enter phone number")}
              register={register}
              error={errors.phone}
              required
            />
            <TextField
              id={`${submitLabel}-idNo`}
              label={t("ID No.")}
              name="idNo"
              placeholder={t("Enter ID number")}
              register={register}
              error={errors.idNo}
              required
            />
            <SelectField
              id={`${submitLabel}-bloodGroup`}
              label={t("Blood Group")}
              name="bloodGroup"
              placeholder={t("Select blood group")}
              options={BLOOD_GROUP_OPTIONS}
              register={register}
              error={errors.bloodGroup}
              required
            />
            <TextField
              id={`${submitLabel}-block`}
              label={t("Block")}
              name="block"
              placeholder={t("Enter block")}
              register={register}
              error={errors.block}
              required
            />
            <SelectField
              id={`${submitLabel}-district`}
              label={t("District")}
              name="district"
              placeholder={t("Select district")}
              options={BIHAR_DISTRICTS}
              register={register}
              error={errors.district}
              required
            />
            <SelectField
              id={`${submitLabel}-vidhansabha`}
              label={t("Assembly Constituency")}
              name="vidhansabha"
              placeholder={selectedDistrict ? t("Select vidhansabha") : t("Select district first")}
              options={vidhansabhaOptions}
              register={register}
              error={errors.vidhansabha}
              required
            />
            <TextField
              id={`${submitLabel}-fullAddress`}
              label={t("Full Address")}
              name="fullAddress"
              placeholder={t("Village / Mohalla / street / address")}
              register={register}
              error={errors.fullAddress}
              className="md:col-span-2"
              required
            />
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor={`${submitLabel}-profileImage`}>
                {t("Profile Picture")}
              </label>
              <div className="rounded-[1.4rem] border border-orange-200 bg-white/90 p-4">
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.2rem] border border-dashed border-orange-300 bg-orange-50/60 px-4 py-6 text-center transition hover:bg-orange-100/70">
                  <ImagePlus className="size-7 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Choose profile picture</p>
                    <p className="mt-1 text-xs text-slate-600">{t("JPG, PNG, or WEBP up to 2MB.")}</p>
                  </div>
                  <input
                    key={profileImageInputKey}
                    id={`${submitLabel}-profileImage`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              {profileImagePreviewUrl ? (
                <div className="overflow-hidden rounded-[1.25rem] border border-orange-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <Image
                      src={profileImagePreviewUrl}
                      alt="Profile preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-slate-900">{profileImageFile?.name || "Profile image"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {profileImageFile ? `${Math.max(1, Math.round(profileImageFile.size / 1024))} KB` : ""}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}

        <div className={`space-y-2 ${isLeaderForm ? "" : "md:col-span-1"}`}>
          <label className="text-sm font-medium" htmlFor={`${submitLabel}-password`}>
            {t("Password")}
            <span className="ml-1 text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id={`${submitLabel}-password`}
              type={showPassword ? "text" : "password"}
              placeholder={t("Enter password")}
              {...register("password")}
              required
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
            />
            <button
              type="button"
              aria-label={showPassword ? t("Hide password") : t("Show password")}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div className={`space-y-2 ${isLeaderForm ? "" : "md:col-span-1"}`}>
          <label className="text-sm font-medium" htmlFor={`${submitLabel}-confirmPassword`}>
            {t("Confirm Password")}
            <span className="ml-1 text-destructive">*</span>
          </label>
          <input
            id={`${submitLabel}-confirmPassword`}
            type="password"
            placeholder={t("Confirm password")}
            {...register("confirmPassword")}
            required
            className="flex h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2 ${submitButtonClass}`}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              {t("Creating")}
            </>
          ) : (
            t(submitLabel)
          )}
        </button>

        {isLeaderForm && paymentChoice ? (
          <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/70 p-5 md:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                  Registration created
                </p>
                <h3 className="mt-2 text-lg font-semibold text-emerald-950">
                  Choose payment status for {paymentChoice.name}
                </h3>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Select `Paid` to collect ₹100 through Razorpay, or `Unpaid` to keep this leader locked.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleMarkUnpaid}
                  disabled={isPaymentBusy}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPaymentBusy ? <LoaderCircle className="size-4 animate-spin" /> : <Lock className="size-4" />}
                  Mark Unpaid
                </button>
                <button
                  type="button"
                  onClick={handlePaidPayment}
                  disabled={isPaymentBusy}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPaymentBusy ? <LoaderCircle className="size-4 animate-spin" /> : <CircleDollarSign className="size-4" />}
                  Pay ₹100
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/80 p-4 text-sm text-emerald-950">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-4 text-emerald-700" />
                Leader account has been created.
              </div>
              <p className="mt-2 text-emerald-900/80">
                Until payment is completed, this leader stays locked with pending payment status.
              </p>
            </div>
          </div>
        ) : null}
      </form>
    </section>
  );
}
