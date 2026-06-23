import { connectDB } from "@/lib/connectDB";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 });
    }

    await connectDB(); // Connect to the database

  return NextResponse.json({
     success: true,
     message: "Connected to database successfully",
     data: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        name: session.name
     }
    });   
}
