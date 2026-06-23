import { verificationEmail } from "@/email/verificationEmail";
import { connectDB } from "@/lib/connectDB";
import { getLockedUserMessage } from "@/lib/authUser";
import { errorResponse, successResponse } from "@/lib/helper";
import { AUTH_COOKIE_NAME, authCookieOptions, createAuthToken } from "@/lib/session";
import { sendMail } from "@/lib/sendMail";
import { zodLoginSchema } from "@/lib/zodSchema";
import UserModel from "@/models/userSchema";
import { SignJWT } from "jose";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();

        const validateData = zodLoginSchema.safeParse(data);
        if (!validateData.success) {
            return errorResponse(400, "Invalid data", validateData.error.issues);
        }
        const { email, password } = validateData.data;
        const normalizedEmail = email.trim().toLowerCase();


        // email verification
        const user = await UserModel.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return errorResponse(404, "User not found");
        }

        if (user.isLocked) {
            return errorResponse(403, getLockedUserMessage({
                lockReason: user.LockReason?.trim() || "",
            }));
        }

        // password verification
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse(401, "Invalid credentials");
        }
//email verification
        if (!user.isEmailVerified) {
            const secret = new TextEncoder().encode(process.env.SECRET_KEY);
            const token = await new SignJWT({ userId: user._id.toString() })
                .setIssuedAt()
                .setExpirationTime('1h')
                .setProtectedHeader({ alg: 'HS256' })
                .sign(secret);

            const link = {
                name: user.name,
                loginUrl: `${process.env.NEXT_PUBLIC_URL}/auth/verify-email/${token}`
            };
            const emailBody = verificationEmail({ link });
            const mailResult = await sendMail(user.email, "Verification Email", emailBody);

            if (mailResult.success) {
                return errorResponse(400, "Your email is not verified. I sent a verification email, please verify your email first.");
            }

            return errorResponse(400, "Your email is not verified, and the verification email could not be sent.");
        }
// store session and jwt token in cookies

        const authToken = await createAuthToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });

        const response = successResponse(200, "Login successful", {
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

        response.cookies.set(AUTH_COOKIE_NAME, authToken, authCookieOptions);
        return response;
    } catch (error) {
        return errorResponse(500, error?.message || "Internal server error");
    }
}
