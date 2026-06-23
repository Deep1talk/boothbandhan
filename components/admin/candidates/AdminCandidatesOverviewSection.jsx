"use client";

import AdminCandidatesOverview from "@/components/admin/candidates/AdminCandidatesOverview";
import { useRemoteData } from "@/hooks/useRemoteData";
import { toastAlert } from "@/lib/toastAlert";
import { getCandidates } from "@/lib/client/usersClient";

export default function AdminCandidatesOverviewSection() {
  const { data } = useRemoteData(getCandidates, {
    initialData: {
      counts: {
        candidates: 0,
        leaders: 0,
        standaloneLeaders: 0,
        totalLeaders: 0,
        paidLeaders: 0,
        unpaidLeaders: 0,
      },
    },
    onError: (error) => {
      toastAlert("error", error.response?.data?.message || error.message || "Unable to load overview.");
    },
  });

  return <AdminCandidatesOverview counts={data.counts} />;
}
