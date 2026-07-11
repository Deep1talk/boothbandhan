import { z } from "zod";
import {
  BIHAR_DISTRICTS,
  BIHAR_DISTRICT_VIDHANSHABHA_MAP,
  BLOOD_GROUP_OPTIONS,
  CASTE_CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  YES_NO_OPTIONS,
} from "@/lib/leaderRegistration";

export const zodLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const zodSendOtpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const zodOtpVerifySchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit OTP"),
});

export const zodVerifyOtpWithEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  otp: z
    .string()
    .min(1, "OTP is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit OTP"),
});

export const zodResetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const zodChangePasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const zodProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
});

const optionalHandle = z
  .string()
  .trim()
  .max(120, "Keep this field under 120 characters")
  .optional()
  .or(z.literal(""));

export const zodLeaderGreetingProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  greetingTagline: z
    .string()
    .trim()
    .min(1, "Tagline or designation is required")
    .max(180, "Keep the designation under 180 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,10}$/, "Enter a valid 10-digit phone number"),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{10,10}$/, "Enter a valid 10-digit WhatsApp number"),
  instagramHandle: optionalHandle,
  twitterHandle: optionalHandle,
  facebookHandle: optionalHandle,
  posterPhotoScale: z.coerce
    .number()
    .min(0.6, "Photo zoom must be at least 0.6")
    .max(2.5, "Photo zoom must be at most 2.5"),
  posterPhotoOffsetX: z.coerce
    .number()
    .min(-220, "Horizontal crop offset is too small")
    .max(220, "Horizontal crop offset is too large"),
  posterPhotoOffsetY: z.coerce
    .number()
    .min(-220, "Vertical crop offset is too small")
    .max(220, "Vertical crop offset is too large"),
});

export const zodFestivalTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Template title is required")
    .max(100, "Template title must be under 100 characters"),
  cardBackgroundColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Choose a valid background color"),
  contactStripBackgroundColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Choose a valid contact strip color"),
  nameTextColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Choose a valid name color"),
  taglineTextColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Choose a valid tagline color"),
  contactTextColor: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Choose a valid contact text color"),
  fontFamily: z
    .string()
    .trim()
    .min(1, "Choose a font"),
  isActive: z.coerce.boolean(),
  startDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  endDate: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  if (!data.startDate || !data.endDate) {
    return true;
  }

  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  path: ["endDate"],
  message: "End date must be after the start date",
});

export const zodLoggedInPasswordUpdateSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const zodRegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10,10}$/, "Enter a valid phone number"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSchema = zodRegisterSchema;
export const zodCreateManagedUserSchema = zodRegisterSchema.extend({
  idNo: z
    .string()
    .trim()
    .min(1, "ID number is required")
    .max(80, "ID number must be under 80 characters"),
  bloodGroup: z.enum(BLOOD_GROUP_OPTIONS, { message: "Please select blood group" }),
  fullAddress: z
    .string()
    .trim()
    .min(1, "Full address is required"),
  block: z
    .string()
    .min(1, "Block is required"),
  district: z.enum(BIHAR_DISTRICTS, { message: "Please select district" }),
  vidhansabha: z
    .string()
    .min(1, "Please select vidhansabha"),
}).refine((data) => {
  const seats = BIHAR_DISTRICT_VIDHANSHABHA_MAP[data.district] ?? [];
  return seats.includes(data.vidhansabha);
}, {
  message: "Please select a valid vidhansabha for the district",
  path: ["vidhansabha"],
});

export const zodAdminUpdateManagedUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\d{10,10}$/, "Enter a valid phone number"),
  idNo: z
    .string()
    .trim()
    .min(1, "ID number is required")
    .max(80, "ID number must be under 80 characters"),
  bloodGroup: z.enum(BLOOD_GROUP_OPTIONS, { message: "Please select blood group" }),
  fullAddress: z
    .string()
    .trim()
    .min(1, "Full address is required"),
  block: z
    .string()
    .trim()
    .min(1, "Block is required"),
  district: z.enum(BIHAR_DISTRICTS, { message: "Please select district" }),
  vidhansabha: z
    .string()
    .trim()
    .min(1, "Please select vidhansabha"),
}).refine((data) => {
  const seats = BIHAR_DISTRICT_VIDHANSHABHA_MAP[data.district] ?? [];
  return seats.includes(data.vidhansabha);
}, {
  message: "Please select a valid vidhansabha for the district",
  path: ["vidhansabha"],
});

export const zodCreateLeaderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  fatherName: z
    .string()
    .min(1, "Father or husband name is required"),
  age: z.coerce
    .number({ message: "Age is required" })
    .min(18, "Age must be at least 18"),
  gender: z.enum(GENDER_OPTIONS, { message: "Please select gender" }),
  casteCategory: z.enum(CASTE_CATEGORY_OPTIONS, { message: "Please select caste category" }),
  religion: z.enum(RELIGION_OPTIONS, { message: "Please select religion" }),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d{10,10}$/, "Enter a valid phone number"),
  whatsappNumber: z
    .string()
    .min(1, "WhatsApp number is required")
    .regex(/^\d{10,10}$/, "Enter a valid WhatsApp number"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(1, "Confirm password is required"),
  fullAddress: z
    .string()
    .min(1, "Full address is required"),
  ward: z
    .string()
    .min(1, "Ward is required"),
  panchayat: z
    .string()
    .min(1, "Panchayat is required"),
  block: z
    .string()
    .min(1, "Block is required"),
  district: z.enum(BIHAR_DISTRICTS, { message: "Please select district" }),
  vidhansabha: z
    .string()
    .min(1, "Please select vidhansabha"),
  currentParty: z
    .string()
    .min(1, "Current party is required"),
  politicalPosition: z
    .string()
    .min(1, "Position is required"),
  hasContestedElection: z.enum(YES_NO_OPTIONS, { message: "Please select election history" }),
  experienceYears: z.coerce
    .number({ message: "Experience is required" })
    .min(0, "Experience cannot be negative"),
  mainSupportBase: z
    .string()
    .min(1, "Main support base is required"),
  activeWorkerCount: z.coerce
    .number({ message: "Active worker count is required" })
    .min(0, "Active worker count cannot be negative"),
  totalVoters: z.coerce
    .number({ message: "Total voters is required" })
    .min(0, "Total voters cannot be negative"),
  hasTenHouseWorkers: z.enum(YES_NO_OPTIONS, { message: "Please select 10 house worker status" }),
  digitalCampaign: z.enum(YES_NO_OPTIONS, { message: "Please select digital campaign readiness" }),
  financialPreparedness: z.enum(YES_NO_OPTIONS, { message: "Please select financial readiness" }),
  topIssue1: z
    .string()
    .optional(),
  topIssue2: z
    .string()
    .optional(),
  topIssue3: z
    .string()
    .optional(),
  declarationAccepted: z.boolean().refine((value) => value, {
    message: "Declaration acceptance is required",
  }),
  registrationDate: z
    .string()
    .min(1, "Date is required"),
  registrationPlace: z
    .string()
    .min(1, "Place is required"),
  signatureName: z
    .string()
    .min(1, "Signature name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  const seats = BIHAR_DISTRICT_VIDHANSHABHA_MAP[data.district] ?? [];
  return seats.includes(data.vidhansabha);
}, {
  message: "Please select a valid vidhansabha for the district",
  path: ["vidhansabha"],
});
