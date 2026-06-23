import { NextResponse } from "next/server";

export const successResponse = (status, message, data = null) => {
    return NextResponse.json(
        { success: true, status, message, data },
        { status }
    );
};

export const errorResponse = (status, message, error = null) => {
    return NextResponse.json(
        { success: false, status, message, error },
        { status }
    );
};

export const catchError = (error = null) => {
    const status = error?.status || error?. statusCode || 500;
    const message = error?.message || "Internal server error";

    return NextResponse.json(
        { success: false, status, message, error },
        { status }
    )
}

export const genrateOtp = ()=>{
    const otp = Math.floor(100000+Math.random()*900000).toString()
    return otp
}