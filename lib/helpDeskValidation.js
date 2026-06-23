import { z } from "zod";
import { HELP_DESK_ISSUE_OPTIONS } from "@/lib/helpDeskOptions";

const issueCategoryValues = HELP_DESK_ISSUE_OPTIONS.map((item) => item.value);
const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^[0-9]{10}$/.test(value),
    "Ward Incharge Mobile must be a 10-digit number"
  );

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeOptionalBoolean(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "yes" || value === "true") {
    return true;
  }

  if (value === "no" || value === "false") {
    return false;
  }

  return null;
}

function isFamilyMemberFilled(member) {
  return Boolean(
    member?.name ||
      member?.relation ||
      member?.age !== undefined ||
      member?.gender ||
      member?.mobileNumber ||
      member?.educationOrOccupation
  );
}

export const helpDeskFamilyMemberSchema = z.object({
  name: z.string().trim().max(120).optional().default(""),
  relation: z.string().trim().max(80).optional().default(""),
  age: z.preprocess(
    normalizeOptionalNumber,
    z.number().int().min(0).max(120).optional()
  ),
  gender: z.string().trim().max(30).optional().default(""),
  mobileNumber: z.string().trim().max(20).optional().default(""),
  educationOrOccupation: z.string().trim().max(160).optional().default(""),
});

export const helpDeskProblemSchema = z.object({
  constituency: z
    .string()
    .trim()
    .min(2, "Vidhan Sabha / Constituency is required")
    .max(120),
  block: z.string().trim().min(2, "Block is required").max(120),
  panchayat: z.string().trim().min(2, "Gram Panchayat is required").max(120),
  wardNumber: z.string().trim().min(1, "Ward Number is required").max(60),
  wardInchargeName: z.string().trim().max(120).optional().default(""),
  wardInchargePhone: optionalPhoneSchema,
  headOfFamilyName: z
    .string()
    .trim()
    .min(2, "Head of Family Name is required")
    .max(120),
  fatherOrSpouseName: z.string().trim().max(120).optional().default(""),
  age: z.preprocess(
    normalizeOptionalNumber,
    z.number().int().min(0, "Age is required").max(120)
  ),
  gender: z.string().trim().min(1, "Gender is required").max(30),
  casteCategory: z.string().trim().max(60).optional().default(""),
  mobileNumber: z
    .string()
    .trim()
    .min(10, "Mobile Number is required")
    .max(20),
  whatsappNumber: z
    .string()
    .trim()
    .min(10, "WhatsApp Number is required")
    .max(20),
  localAddress: z
    .string()
    .trim()
    .min(5, "Local Address / Tola is required")
    .max(500),
  totalFamilyMembers: z.preprocess(
    normalizeOptionalNumber,
    z
      .number()
      .int()
      .min(1, "Total Family Members is required")
      .max(100)
  ),
  familyMembers: z
    .array(helpDeskFamilyMemberSchema)
    .max(12)
    .refine(
      (members) => members.some((member) => isFamilyMemberFilled(member)),
      "Add at least one family member detail"
    ),
  issueCategories: z
    .array(z.enum(issueCategoryValues))
    .min(1, "Select at least one problem category")
    .max(issueCategoryValues.length),
  issueDetails: z
    .string()
    .trim()
    .min(10, "Detailed problem description is required")
    .max(3000),
  verifierComment: z.string().trim().max(1500).optional().default(""),
  wantsToJoinOrganization: z.preprocess(
    normalizeOptionalBoolean,
    z.boolean().nullable()
  ),
});
