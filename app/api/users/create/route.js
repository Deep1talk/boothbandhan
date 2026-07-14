import { connectDB } from "@/lib/connectDB";
import { destroyCloudinaryImage, uploadImageToCloudinary } from "@/lib/cloudinary";
import { getLockedUserMessage, getRequestUser } from "@/lib/authUser";
import { errorResponse, successResponse } from "@/lib/helper";
import { zodCreateLeaderSchema, zodCreateManagedUserSchema } from "@/lib/zodSchema";
import { createUserWithVerification, getChildRoleForParent } from "@/lib/userCreation";

export async function POST(req) {
  try {
    await connectDB();
    const verificationBaseUrl = new URL(req.url).origin;
    const { session, user } = await getRequestUser(req);

    if (!session?.userId || !user) {
      return errorResponse(401, "Unauthorized");
    }

    if (user.isLocked) {
      return errorResponse(403, getLockedUserMessage(user));
    }

    const childRole = getChildRoleForParent(user.role);
    if (!childRole) {
      return errorResponse(403, "You are not allowed to create child users");
    }

    const formData = await req.formData();
    const rawEntries = Object.fromEntries(formData.entries());
    const profileImageFile = formData.get("profileImage");
    const data = {
      ...rawEntries,
      declarationAccepted:
        rawEntries.declarationAccepted === true ||
        rawEntries.declarationAccepted === "true" ||
        rawEntries.declarationAccepted === "on",
    };
    const validateData = (childRole === "Leader" ? zodCreateLeaderSchema : zodCreateManagedUserSchema).safeParse(data);
    if (!validateData.success) {
      return errorResponse(400, "Invalid data", validateData.error.issues);
    }

    let uploadedProfileImage = null;

    if (profileImageFile instanceof File && profileImageFile.size > 0) {
      if (!profileImageFile.type.startsWith("image/")) {
        return errorResponse(400, "Profile photo must be an image file");
      }

      if (profileImageFile.size > 2 * 1024 * 1024) {
        return errorResponse(400, "Profile photo must be 2MB or smaller");
      }

      uploadedProfileImage = await uploadImageToCloudinary(profileImageFile);
    }

    const { name, email, password, phone } = validateData.data;
    const sharedProfileData = uploadedProfileImage
      ? {
          avatar: uploadedProfileImage.url,
          avatarPublicId: uploadedProfileImage.publicId,
        }
      : {};

    let result;

    try {
      result = await createUserWithVerification({
        name,
        email,
        password,
        phone,
        role: childRole,
        parentId: user.id,
        verificationBaseUrl,
        profileData: childRole === "Leader" ? {
          ...sharedProfileData,
          fatherName: validateData.data.fatherName,
          age: validateData.data.age,
          gender: validateData.data.gender,
          casteCategory: validateData.data.casteCategory,
          religion: validateData.data.religion,
          whatsappNumber: validateData.data.whatsappNumber,
          fullAddress: validateData.data.fullAddress,
          ward: validateData.data.ward,
          panchayat: validateData.data.panchayat,
          block: validateData.data.block,
          district: validateData.data.district,
          vidhansabha: validateData.data.vidhansabha,
          currentParty: validateData.data.currentParty,
          politicalPosition: validateData.data.politicalPosition,
          hasContestedElection: validateData.data.hasContestedElection,
          experienceYears: validateData.data.experienceYears,
          mainSupportBase: validateData.data.mainSupportBase,
          activeWorkerCount: validateData.data.activeWorkerCount,
          totalVoters: validateData.data.totalVoters,
          hasTenHouseWorkers: validateData.data.hasTenHouseWorkers,
          digitalCampaign: validateData.data.digitalCampaign,
          financialPreparedness: validateData.data.financialPreparedness,
          topIssues: [
            validateData.data.topIssue1,
            validateData.data.topIssue2,
            validateData.data.topIssue3,
          ],
          socialWorkerAshaName: validateData.data.socialWorkerAshaName,
          socialWorkerAshaPhone: validateData.data.socialWorkerAshaPhone,
          socialWorkerJeevikaDidiName: validateData.data.socialWorkerJeevikaDidiName,
          socialWorkerJeevikaDidiPhone: validateData.data.socialWorkerJeevikaDidiPhone,
          socialWorkerAaganBadiSevikaName: validateData.data.socialWorkerAaganBadiSevikaName,
          socialWorkerAaganBadiSevikaPhone: validateData.data.socialWorkerAaganBadiSevikaPhone,
          declarationAccepted: validateData.data.declarationAccepted,
          registrationDate: validateData.data.registrationDate,
          registrationPlace: validateData.data.registrationPlace,
          signatureName: validateData.data.signatureName,
        } : {
          ...sharedProfileData,
          idNo: validateData.data.idNo,
          bloodGroup: validateData.data.bloodGroup,
          fullAddress: validateData.data.fullAddress,
          block: validateData.data.block,
          district: validateData.data.district,
          vidhansabha: validateData.data.vidhansabha,
        },
        userState: childRole === "Leader" ? {
          isLocked: true,
          LockReason: "Registration payment pending.",
          registrationFeePaid: false,
          registrationPaymentStatus: "pending",
          paymentStatus: "pending",
          registrationPaymentAmount: 100,
        } : null,
      });
    } catch (error) {
      if (uploadedProfileImage?.publicId) {
        await destroyCloudinaryImage(uploadedProfileImage.publicId).catch(() => null);
      }

      throw error;
    }

    if (!result.success) {
      if (uploadedProfileImage?.publicId) {
        await destroyCloudinaryImage(uploadedProfileImage.publicId).catch(() => null);
      }

      return errorResponse(result.status, result.message);
    }

    return successResponse(result.status, result.message, {
      user: {
        id: result.user._id.toString(),
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        parentId: result.user.parentId,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(400, "User already exists");
    }

    if (error instanceof SyntaxError) {
      return errorResponse(400, "Invalid request body");
    }

    return errorResponse(500, error?.message || "Internal server error");
  }
}
