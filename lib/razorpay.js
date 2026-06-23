import crypto from "crypto";

const REGISTRATION_PAYMENT_AMOUNT = 100;

function getRazorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return {
    keyId,
    keySecret,
    authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
  };
}

export function getRegistrationPaymentAmount() {
  return REGISTRATION_PAYMENT_AMOUNT;
}

export function getRegistrationPaymentAmountInPaise() {
  return REGISTRATION_PAYMENT_AMOUNT * 100;
}

export function getRazorpayPublicKey() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}

export async function createRazorpayOrder({ receipt, notes = {} }) {
  const { authorization } = getRazorpayAuthHeader();
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: getRegistrationPaymentAmountInPaise(),
      currency: "INR",
      receipt,
      notes,
    }),
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.description || "Unable to create Razorpay order");
  }

  return payload;
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new Error("Razorpay secret is not configured");
  }

  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return digest === signature;
}
