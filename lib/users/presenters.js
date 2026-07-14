export const USER_LIST_FIELDS = "name email phone idNo bloodGroup avatar avatarPublicId role fatherName age gender casteCategory religion whatsappNumber fullAddress ward panchayat block district vidhansabha currentParty politicalPosition hasContestedElection experienceYears mainSupportBase activeWorkerCount totalVoters hasTenHouseWorkers digitalCampaign financialPreparedness topIssues socialWorkerAshaName socialWorkerAshaPhone socialWorkerJeevikaDidiName socialWorkerJeevikaDidiPhone socialWorkerAaganBadiSevikaName socialWorkerAaganBadiSevikaPhone registrationFeePaid registrationPaymentStatus paymentStatus registrationPaymentAmount declarationAccepted registrationDate registrationPlace signatureName isEmailVerified isLocked LockReason createdAt parentId";

export function toManagedUserPayload(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    idNo: user.idNo || "",
    bloodGroup: user.bloodGroup || "",
    fatherName: user.fatherName || "",
    age: user.age ?? null,
    gender: user.gender || "",
    casteCategory: user.casteCategory || "",
    religion: user.religion || "",
    whatsappNumber: user.whatsappNumber || "",
    fullAddress: user.fullAddress || "",
    ward: user.ward || "",
    panchayat: user.panchayat || "",
    block: user.block || "",
    district: user.district || "",
    vidhansabha: user.vidhansabha || "",
    currentParty: user.currentParty || "",
    politicalPosition: user.politicalPosition || "",
    hasContestedElection: user.hasContestedElection || "",
    experienceYears: user.experienceYears ?? null,
    mainSupportBase: user.mainSupportBase || "",
    activeWorkerCount: user.activeWorkerCount ?? null,
    totalVoters: user.totalVoters ?? null,
    hasTenHouseWorkers: user.hasTenHouseWorkers || "",
    digitalCampaign: user.digitalCampaign || "",
    financialPreparedness: user.financialPreparedness || "",
    topIssues: Array.isArray(user.topIssues) ? user.topIssues : [],
    socialWorkerAshaName: user.socialWorkerAshaName || "",
    socialWorkerAshaPhone: user.socialWorkerAshaPhone || "",
    socialWorkerJeevikaDidiName: user.socialWorkerJeevikaDidiName || "",
    socialWorkerJeevikaDidiPhone: user.socialWorkerJeevikaDidiPhone || "",
    socialWorkerAaganBadiSevikaName: user.socialWorkerAaganBadiSevikaName || "",
    socialWorkerAaganBadiSevikaPhone: user.socialWorkerAaganBadiSevikaPhone || "",
    registrationFeePaid: Boolean(user.registrationFeePaid),
    registrationPaymentStatus: user.registrationPaymentStatus || "pending",
    paymentStatus: user.paymentStatus || user.registrationPaymentStatus || "pending",
    registrationPaymentAmount: user.registrationPaymentAmount ?? 0,
    declarationAccepted: Boolean(user.declarationAccepted),
    registrationDate: user.registrationDate || "",
    registrationPlace: user.registrationPlace || "",
    signatureName: user.signatureName || "",
    avatar: user.avatar || "",
    avatarPublicId: user.avatarPublicId || "",
    role: user.role,
    isEmailVerified: Boolean(user.isEmailVerified),
    isLocked: Boolean(user.isLocked),
    lockReason: user.LockReason?.trim() || "",
    createdAt: user.createdAt,
    parentId: user.parentId?.toString() ?? null,
    parentName: user.parentName || "",
    parentRole: user.parentRole || "",
    leaderSource: user.leaderSource || (user.parentId ? "candidate" : "direct"),
  };
}

export function toLockPayload(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    parentId: user.parentId?.toString() ?? null,
    isLocked: Boolean(user.isLocked),
    lockReason: user.LockReason?.trim() || "",
  };
}
