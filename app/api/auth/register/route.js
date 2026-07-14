import { connectDB } from "@/lib/connectDB";
import { errorResponse, successResponse } from "@/lib/helper";
import { zodRegisterSchema } from "@/lib/zodSchema";
import { createUserWithVerification } from "@/lib/userCreation";

export async function POST(req) {
    try {
        await connectDB();
        const data = await req.json();
        const verificationBaseUrl = new URL(req.url).origin;

        const validateData = zodRegisterSchema.safeParse(data);
        if (!validateData.success) {
            return errorResponse(400, "Invalid data", validateData.error.issues);
        }

        const { name, email, password, phone } = validateData.data;
        const result = await createUserWithVerification({
            name,
            email,
            password,
            phone,
            role: "Leader",
            parentId: null,
            verificationBaseUrl,
        });

        if (!result.success) {
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
        console.error("Register route error:", error);

        if (error?.code === 11000) {
            return errorResponse(400, "User already exists");
        }
        
        if (error?.name === "ValidationError") {
            const issues = Object.values(error.errors || {}).map((item) => item.message);
            return errorResponse(400, "Validation failed", issues);
        }//this map loop for showing multiple zod error

        if (error instanceof SyntaxError) {
            return errorResponse(400, "Invalid request body");
        }

        return errorResponse(500, error?.message || "Internal server error");
    }
}
