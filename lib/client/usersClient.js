"use client";

import axios from "axios";
import { buildManagedUserQueryParams } from "@/lib/managedUserFilters";

export async function getCandidates(options = {}) {
  const { data: response } = await axios.get("/api/users/candidates", {
    params: Object.fromEntries(buildManagedUserQueryParams(options)),
  });
  return response.data;
}

export async function getLeaders(options = {}) {
  const { data: response } = await axios.get("/api/users/leaders", {
    params: Object.fromEntries(buildManagedUserQueryParams(options)),
  });
  return response.data;
}

export async function getDirectLeaders(options = {}) {
  const { data: response } = await axios.get("/api/users/direct-leaders", {
    params: Object.fromEntries(buildManagedUserQueryParams(options)),
  });
  return response.data;
}

export async function getCandidateLeaders(candidateId, options = {}) {
  const { data: response } = await axios.get(`/api/users/candidates/${candidateId}/leaders`, {
    params: Object.fromEntries(buildManagedUserQueryParams(options)),
  });
  return response.data;
}

export async function toggleManagedUserLock(userId, shouldLock) {
  const { data: response } = shouldLock
    ? await axios.post(`/api/users/${userId}/lock`)
    : await axios.delete(`/api/users/${userId}/lock`);

  return response.data?.user ?? null;
}

export async function createLeaderRegistrationPaymentOrder(userId) {
  const { data: response } = await axios.post(`/api/users/${userId}/registration-payment/order`);
  return response.data;
}

export async function confirmLeaderRegistrationPayment(userId, paymentResult) {
  const { data: response } = await axios.post(
    `/api/users/${userId}/registration-payment/confirm`,
    paymentResult
  );
  return response.data;
}

export async function confirmLeaderCashPayment(userId) {
  const { data: response } = await axios.post(
    `/api/users/${userId}/registration-payment/cash`
  );
  return response.data;
}

export async function getLeaderHelpDeskProblems() {
  const { data: response } = await axios.get("/api/help-desk/problems");
  return response.data;
}

export async function createLeaderHelpDeskProblem(payload) {
  const { data: response } = await axios.post("/api/help-desk/problems", payload);
  return response;
}

export async function getAdminLeaderProblems(leaderId) {
  const { data: response } = await axios.get(`/api/help-desk/leaders/${leaderId}/problems`);
  return response.data;
}
