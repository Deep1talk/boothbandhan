"use client";

import AdminCandidatesListSection from "@/components/admin/candidates/AdminCandidatesListSection";
import AdminCandidatesOverview from "@/components/admin/candidates/AdminCandidatesOverview";
import AdminCreateCandidateSection from "@/components/admin/candidates/AdminCreateCandidateSection";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getCandidates } from "@/lib/client/usersClient";
import { toastAlert } from "@/lib/toastAlert";

export default function AdminCandidatesSection() {
  const { data, isLoading, isRefreshing, refresh } = useRemoteData(getCandidates, {
    initialData: {
      candidates: [],
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
      toastAlert(
        "error",
        error.response?.data?.message || error.message || "Unable to load candidates."
      );
    },
  });

  return (
    <>
      <AdminCandidatesOverview counts={data.counts} />
      <AdminCreateCandidateSection onSuccess={refresh} />
      <AdminCandidatesListSection
        candidates={data.candidates}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />
    </>
  );
}
