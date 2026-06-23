"use client";

import CandidateLeadersOverview from "@/components/candidate/leaders/CandidateLeadersOverview";
import { useRemoteData } from "@/hooks/useRemoteData";
import { getLeaders } from "@/lib/client/usersClient";
import { toastAlert } from "@/lib/toastAlert";

export default function CandidateLeadersOverviewSection() {
  const { data } = useRemoteData(getLeaders, {
    initialData: {
      counts: {
        leaders: 0,
        paidLeaders: 0,
        unpaidLeaders: 0,
        pendingLeaders: 0,
        attendanceDays: 0,
        todayRegistrations: 0,
        todayPaidRegistrations: 0,
        isPresentToday: false,
        currentMonthAttendance: 0,
        currentMonthKey: "",
        monthlyAttendance: [],
        attendanceRegistrationTarget: 12,
        attendancePaidTarget: 6,
      },
    },
    onError: (error) => {
      toastAlert("error", error.response?.data?.message || error.message || "Unable to load overview.");
    },
  });

  return <CandidateLeadersOverview counts={data.counts} />;
}
