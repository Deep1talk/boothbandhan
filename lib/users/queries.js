import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import UserModel from "@/models/userSchema";
import {
  toLockPayload,
  toManagedUserPayload,
  USER_LIST_FIELDS,
} from "@/lib/users/presenters";

const ATTENDANCE_REGISTRATION_TARGET = 12;
const ATTENDANCE_PAID_TARGET = 6;
const SUMMARY_LEADER_FIELDS =
  "_id parentId createdAt paymentStatus registrationPaymentStatus registrationFeePaid";

async function backfillLeaderPaymentStatuses() {
  const leadersNeedingBackfill = await UserModel.find({
    role: "Leader",
    $or: [
      { paymentStatus: { $exists: false } },
      { paymentStatus: null },
      { paymentStatus: "" },
    ],
  })
    .select("_id registrationPaymentStatus registrationFeePaid")
    .lean();

  if (!leadersNeedingBackfill.length) {
    return;
  }

  const operations = leadersNeedingBackfill.map((leader) => {
    let paymentStatus = "pending";

    if (
      leader.registrationPaymentStatus === "paid" ||
      leader.registrationFeePaid === true
    ) {
      paymentStatus = "paid";
    } else if (leader.registrationPaymentStatus === "unpaid") {
      paymentStatus = "unpaid";
    }

    return {
      updateOne: {
        filter: { _id: leader._id },
        update: {
          $set: { paymentStatus },
        },
      },
    };
  });

  await UserModel.bulkWrite(operations, { ordered: false });
}

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildDateRange(startDate, endDate) {
  const range = {};

  if (startDate) {
    range.$gte = new Date(`${startDate}T00:00:00+05:30`);
  }

  if (endDate) {
    range.$lte = new Date(`${endDate}T23:59:59.999+05:30`);
  }

  return Object.keys(range).length ? range : null;
}

function buildManagedUserMatch(filters = {}, options = {}) {
  const conditions = [];
  const searchTerm = filters.search?.trim();
  const blockTerm = filters.block?.trim();
  const extraSearchOrConditions = Array.isArray(options.extraSearchOrConditions)
    ? options.extraSearchOrConditions.filter(Boolean)
    : [];
  const statusMode = options.statusMode || "default";

  if (searchTerm) {
    const regex = new RegExp(escapeRegex(searchTerm), "i");
    conditions.push({
      $or: [
        { name: regex },
        { phone: regex },
        { idNo: regex },
        { block: regex },
        ...extraSearchOrConditions,
      ],
    });
  }

  if (filters.district) {
    conditions.push({ district: filters.district });
  }

  if (filters.bloodGroup) {
    conditions.push({ bloodGroup: filters.bloodGroup });
  }

  if (statusMode === "adminLeader") {
    if (filters.status === "Active") {
      conditions.push({ isLocked: false });
    } else if (filters.status === "Verified") {
      conditions.push({ isEmailVerified: true });
    } else if (filters.status === "Locked") {
      conditions.push({ isLocked: true });
    } else if (filters.status === "Paid") {
      conditions.push({
        $or: [{ paymentStatus: "paid" }, { registrationPaymentStatus: "paid" }],
      });
    } else if (filters.status === "Unpaid") {
      conditions.push({
        $or: [{ paymentStatus: "unpaid" }, { registrationPaymentStatus: "unpaid" }],
      });
    } else if (filters.status === "Pending") {
      conditions.push({
        $or: [
          { paymentStatus: "pending" },
          { registrationPaymentStatus: "pending" },
          {
            $and: [
              {
                $or: [
                  { paymentStatus: { $exists: false } },
                  { paymentStatus: null },
                  { paymentStatus: "" },
                ],
              },
              {
                $or: [
                  { registrationPaymentStatus: { $exists: false } },
                  { registrationPaymentStatus: null },
                  { registrationPaymentStatus: "" },
                ],
              },
            ],
          },
        ],
      });
    }
  } else if (filters.status === "Active") {
    conditions.push({ isLocked: false });
  } else if (filters.status === "Locked") {
    conditions.push({ isLocked: true });
  } else if (filters.status === "Verified") {
    conditions.push({ isEmailVerified: true });
  } else if (filters.status === "Pending") {
    conditions.push({ isEmailVerified: false });
  }

  if (filters.vidhansabha) {
    conditions.push({ vidhansabha: filters.vidhansabha });
  }

  if (blockTerm) {
    conditions.push({ block: new RegExp(escapeRegex(blockTerm), "i") });
  }

  const createdAtRange = buildDateRange(filters.startDate, filters.endDate);

  if (createdAtRange) {
    conditions.push({ createdAt: createdAtRange });
  }

  return conditions.length ? { $and: conditions } : {};
}

function getIndiaDayKey(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getIndiaMonthKey(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).format(new Date(value));
}

function getMonthLabelFromKey(monthKey) {
  if (!monthKey) {
    return "";
  }

  const [year, month] = monthKey.split("-");
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric",
  }).format(new Date(`${year}-${month}-01T00:00:00+05:30`));
}

function buildCandidateAttendanceCounts(leaders) {
  const todayKey = getIndiaDayKey(new Date());
  const attendanceByDay = new Map();

  for (const leader of leaders) {
    const dayKey = getIndiaDayKey(leader.createdAt);

    if (!dayKey) {
      continue;
    }

    const entry = attendanceByDay.get(dayKey) ?? {
      registrations: 0,
      paid: 0,
    };

    entry.registrations += 1;

    if (
      (leader.paymentStatus || leader.registrationPaymentStatus || "pending") ===
      "paid"
    ) {
      entry.paid += 1;
    }

    attendanceByDay.set(dayKey, entry);
  }

  const attendanceDays = Array.from(attendanceByDay.values()).filter(
    (entry) =>
      entry.registrations >= ATTENDANCE_REGISTRATION_TARGET &&
      entry.paid >= ATTENDANCE_PAID_TARGET
  ).length;

  const todayEntry = attendanceByDay.get(todayKey) ?? { registrations: 0, paid: 0 };
  const isPresentToday =
    todayEntry.registrations >= ATTENDANCE_REGISTRATION_TARGET &&
    todayEntry.paid >= ATTENDANCE_PAID_TARGET;
  const monthlyAttendanceMap = new Map();

  for (const [dayKey, entry] of attendanceByDay.entries()) {
    const monthKey = dayKey.slice(0, 7);
    const monthEntry = monthlyAttendanceMap.get(monthKey) ?? {
      monthKey,
      label: getMonthLabelFromKey(monthKey),
      attendanceDays: 0,
      totalRegistrations: 0,
      totalPaidRegistrations: 0,
    };

    monthEntry.totalRegistrations += entry.registrations;
    monthEntry.totalPaidRegistrations += entry.paid;

    if (
      entry.registrations >= ATTENDANCE_REGISTRATION_TARGET &&
      entry.paid >= ATTENDANCE_PAID_TARGET
    ) {
      monthEntry.attendanceDays += 1;
    }

    monthlyAttendanceMap.set(monthKey, monthEntry);
  }

  const currentMonthKey = getIndiaMonthKey(new Date());
  const currentMonthAttendance =
    monthlyAttendanceMap.get(currentMonthKey)?.attendanceDays ?? 0;
  const monthlyAttendance = Array.from(monthlyAttendanceMap.values())
    .sort((left, right) => right.monthKey.localeCompare(left.monthKey))
    .slice(0, 6);

  return {
    attendanceDays,
    todayRegistrations: todayEntry.registrations,
    todayPaidRegistrations: todayEntry.paid,
    isPresentToday,
    currentMonthAttendance,
    currentMonthKey,
    monthlyAttendance,
    attendanceRegistrationTarget: ATTENDANCE_REGISTRATION_TARGET,
    attendancePaidTarget: ATTENDANCE_PAID_TARGET,
  };
}

function buildPagination(page, pageSize, totalItems, itemCount) {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + itemCount - 1;

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    itemCount,
    startIndex,
    endIndex,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

async function findUsersForExport(baseQuery, filters = {}, queryOptions = {}) {
  const query = {
    ...baseQuery,
    ...buildManagedUserMatch(filters, queryOptions),
  };

  return UserModel.find(query)
    .select(USER_LIST_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
}

async function findUsersPage(baseQuery, options = {}, queryOptions = {}) {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const query = {
    ...baseQuery,
    ...buildManagedUserMatch(options.filters, queryOptions),
  };

  const totalItems = await UserModel.countDocuments(query);
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const skip = (safePage - 1) * pageSize;

  const items = await UserModel.find(query)
    .select(USER_LIST_FIELDS)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    items,
    pagination: buildPagination(safePage, pageSize, totalItems, items.length),
  };
}

async function appendLeaderParentDetails(leaders) {
  const parentIds = Array.from(
    new Set(
      leaders
        .map((leader) => leader.parentId?.toString?.() ?? "")
        .filter(Boolean)
    )
  );

  if (!parentIds.length) {
    return leaders.map((leader) => ({
      ...leader,
      parentName: "",
      parentRole: "",
      leaderSource: "direct",
    }));
  }

  const parents = await UserModel.find({
    _id: { $in: parentIds },
  })
    .select("name role")
    .lean();
  const parentMap = parents.reduce((acc, parent) => {
    acc[parent._id.toString()] = parent;
    return acc;
  }, {});

  return leaders.map((leader) => {
    const parentId = leader.parentId?.toString?.() ?? "";
    const parent = parentId ? parentMap[parentId] : null;

    return {
      ...leader,
      parentName: parent?.name || "",
      parentRole: parent?.role || "",
      leaderSource: parentId ? "candidate" : "direct",
    };
  });
}

async function findAdminCandidateIdsMatchingSearch(adminUserId, searchTerm = "") {
  const normalizedSearchTerm = searchTerm.trim();

  if (!normalizedSearchTerm) {
    return [];
  }

  const regex = new RegExp(escapeRegex(normalizedSearchTerm), "i");
  const candidates = await UserModel.find({
    role: "Candidate",
    parentId: adminUserId,
    $or: [
      { name: regex },
      { email: regex },
      { phone: regex },
      { idNo: regex },
      { block: regex },
    ],
  })
    .select("_id")
    .lean();

  return candidates.map((candidate) => candidate._id);
}

async function buildAdminLeaderBaseQuery(adminUserId, filters = {}) {
  const candidateIds = await UserModel.find({
    role: "Candidate",
    parentId: adminUserId,
  })
    .select("_id")
    .lean();
  const managedCandidateIds = candidateIds.map((candidate) => candidate._id);
  const leaderSource = filters.leaderSource || "";

  if (leaderSource === "direct") {
    return {
      baseQuery: {
        role: "Leader",
        parentId: null,
      },
      managedCandidateIds,
    };
  }

  if (leaderSource === "managed") {
    if (!managedCandidateIds.length) {
      return {
        baseQuery: {
          role: "Leader",
          _id: { $in: [] },
        },
        managedCandidateIds,
      };
    }

    return {
      baseQuery: {
        role: "Leader",
        parentId: { $in: managedCandidateIds },
      },
      managedCandidateIds,
    };
  }

  return {
    baseQuery: managedCandidateIds.length
      ? {
          role: "Leader",
          $or: [{ parentId: null }, { parentId: { $in: managedCandidateIds } }],
        }
      : {
          role: "Leader",
          parentId: null,
        },
    managedCandidateIds,
  };
}

function buildLeaderStatusCounts(leaders) {
  const paidLeaders = leaders.filter(
    (leader) =>
      (leader.paymentStatus || leader.registrationPaymentStatus || "pending") ===
      "paid"
  ).length;
  const unpaidLeaders = leaders.filter(
    (leader) =>
      (leader.paymentStatus || leader.registrationPaymentStatus || "pending") ===
      "unpaid"
  ).length;
  const pendingLeaders = leaders.length - paidLeaders - unpaidLeaders;

  return {
    paidLeaders,
    unpaidLeaders,
    pendingLeaders,
  };
}

export async function getCandidateLeadersForAdmin(
  adminUserId,
  candidateId,
  options = {}
) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const candidate = await UserModel.findOne({
    _id: candidateId,
    role: "Candidate",
    parentId: adminUserId,
  })
    .select(USER_LIST_FIELDS)
    .lean();

  if (!candidate) {
    return null;
  }

  const summaryLeaders = await UserModel.find({
    role: "Leader",
    parentId: candidateId,
  })
    .select(SUMMARY_LEADER_FIELDS)
    .lean();

  const { items: leaders, pagination } = await findUsersPage(
    {
      role: "Leader",
      parentId: candidateId,
    },
    options,
    { statusMode: "adminLeader" }
  );

  const statusCounts = buildLeaderStatusCounts(summaryLeaders);
  const attendanceCounts = buildCandidateAttendanceCounts(summaryLeaders);

  return {
    candidate: toManagedUserPayload(candidate),
    leaders: leaders.map(toManagedUserPayload),
    pagination,
    counts: {
      leaders: summaryLeaders.length,
      ...statusCounts,
      ...attendanceCounts,
    },
  };
}

export async function getLeadersForCandidate(candidateUserId, options = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const summaryLeaders = await UserModel.find({
    role: "Leader",
    parentId: candidateUserId,
  })
    .select(SUMMARY_LEADER_FIELDS)
    .lean();

  const { items: leaders, pagination } = await findUsersPage(
    {
      role: "Leader",
      parentId: candidateUserId,
    },
    options,
    { statusMode: "adminLeader" }
  );

  const statusCounts = buildLeaderStatusCounts(summaryLeaders);
  const attendanceCounts = buildCandidateAttendanceCounts(summaryLeaders);

  return {
    leaders: leaders.map(toManagedUserPayload),
    pagination,
    counts: {
      leaders: summaryLeaders.length,
      ...statusCounts,
      ...attendanceCounts,
    },
  };
}

export async function getLeadersForAdmin(adminUserId, options = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const { baseQuery, managedCandidateIds } = await buildAdminLeaderBaseQuery(
    adminUserId,
    options.filters
  );
  const candidateSearchIds = await findAdminCandidateIdsMatchingSearch(
    adminUserId,
    options.filters?.search || ""
  );
  const queryOptions = candidateSearchIds.length
    ? {
        statusMode: "adminLeader",
        extraSearchOrConditions: [{ parentId: { $in: candidateSearchIds } }],
      }
    : { statusMode: "adminLeader" };

  const [directLeaders, candidateLeaders, paged] = await Promise.all([
    UserModel.countDocuments({
      role: "Leader",
      parentId: null,
    }),
    managedCandidateIds.length
      ? UserModel.countDocuments({
          role: "Leader",
          parentId: { $in: managedCandidateIds },
        })
      : 0,
    findUsersPage(baseQuery, options, queryOptions),
  ]);
  const leadersWithParentDetails = await appendLeaderParentDetails(paged.items);

  return {
    leaders: leadersWithParentDetails.map(toManagedUserPayload),
    pagination: paged.pagination,
    counts: {
      leaders: directLeaders + candidateLeaders,
      directLeaders,
      candidateLeaders,
    },
  };
}

export async function getDirectLeadersForAdmin(options = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const totalLeaders = await UserModel.countDocuments({
    role: "Leader",
    parentId: null,
  });

  const { items: leaders, pagination } = await findUsersPage(
    {
      role: "Leader",
      parentId: null,
    },
    options,
    { statusMode: "adminLeader" }
  );

  return {
    leaders: leaders.map(toManagedUserPayload),
    pagination,
    counts: {
      leaders: totalLeaders,
    },
  };
}

export async function getCandidatesForAdmin(adminUserId, options = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const candidateIds = await UserModel.find({
    role: "Candidate",
    parentId: adminUserId,
  })
    .select("_id")
    .lean();

  const allCandidateIds = candidateIds.map((candidate) => candidate._id);

  const leaders = allCandidateIds.length
    ? await UserModel.find({
        role: "Leader",
        parentId: { $in: allCandidateIds },
      })
        .select(SUMMARY_LEADER_FIELDS)
        .lean()
    : [];

  const standaloneLeaders = await UserModel.find({
    role: "Leader",
    parentId: null,
  })
    .select(SUMMARY_LEADER_FIELDS)
    .lean();
  const standaloneLeadersCount = standaloneLeaders.length;

  const { items: candidates, pagination } = await findUsersPage(
    {
      role: "Candidate",
      parentId: adminUserId,
    },
    options
  );

  const pageCandidateIds = candidates.map((candidate) => candidate._id);
  const leaderCountsByCandidate = pageCandidateIds.length
    ? await UserModel.aggregate([
        {
          $match: {
            role: "Leader",
            parentId: { $in: pageCandidateIds },
          },
        },
        {
          $group: {
            _id: "$parentId",
            count: { $sum: 1 },
          },
        },
      ])
    : [];

  const leaderCountMap = leaderCountsByCandidate.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const candidatePayload = candidates.map((candidate) => ({
    ...toManagedUserPayload(candidate),
    leadersCount: leaderCountMap[candidate._id.toString()] ?? 0,
  }));

  const allLeaders = [...leaders, ...standaloneLeaders];
  const paidLeaders = allLeaders.filter(
    (leader) =>
      (leader.paymentStatus || leader.registrationPaymentStatus || "pending") ===
      "paid"
  ).length;
  const unpaidLeaders = allLeaders.length - paidLeaders;

  return {
    candidates: candidatePayload,
    pagination,
    counts: {
      candidates: allCandidateIds.length,
      leaders: leaders.length,
      standaloneLeaders: standaloneLeadersCount,
      totalLeaders: leaders.length + standaloneLeadersCount,
      paidLeaders,
      unpaidLeaders,
    },
  };
}

export async function exportCandidatesForAdmin(adminUserId, filters = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const candidates = await findUsersForExport(
    {
      role: "Candidate",
      parentId: adminUserId,
    },
    filters
  );

  const candidateIds = candidates.map((candidate) => candidate._id);
  const leaderCountsByCandidate = candidateIds.length
    ? await UserModel.aggregate([
        {
          $match: {
            role: "Leader",
            parentId: { $in: candidateIds },
          },
        },
        {
          $group: {
            _id: "$parentId",
            count: { $sum: 1 },
          },
        },
      ])
    : [];

  const leaderCountMap = leaderCountsByCandidate.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  return candidates.map((candidate) => ({
    ...toManagedUserPayload(candidate),
    leadersCount: leaderCountMap[candidate._id.toString()] ?? 0,
  }));
}

export async function exportLeadersForCandidate(candidateUserId, filters = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const leaders = await findUsersForExport(
    {
      role: "Leader",
      parentId: candidateUserId,
    },
    filters,
    { statusMode: "adminLeader" }
  );

  return leaders.map(toManagedUserPayload);
}

export async function exportLeadersForAdmin(adminUserId, filters = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const { baseQuery, managedCandidateIds } = await buildAdminLeaderBaseQuery(
    adminUserId,
    filters
  );
  const candidateSearchIds = await findAdminCandidateIdsMatchingSearch(
    adminUserId,
    filters.search || ""
  );
  const queryOptions = candidateSearchIds.length
    ? {
        statusMode: "adminLeader",
        extraSearchOrConditions: [{ parentId: { $in: candidateSearchIds } }],
      }
    : { statusMode: "adminLeader" };

  const leaders = await findUsersForExport(baseQuery, filters, queryOptions);
  const leadersWithParentDetails = await appendLeaderParentDetails(leaders);

  return leadersWithParentDetails.map(toManagedUserPayload);
}

export async function exportCandidateLeadersForAdmin(
  adminUserId,
  candidateId,
  filters = {}
) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const candidate = await UserModel.findOne({
    _id: candidateId,
    role: "Candidate",
    parentId: adminUserId,
  })
    .select("_id")
    .lean();

  if (!candidate) {
    return null;
  }

  const leaders = await findUsersForExport(
    {
      role: "Leader",
      parentId: candidateId,
    },
    filters,
    { statusMode: "adminLeader" }
  );

  return leaders.map(toManagedUserPayload);
}

export async function exportDirectLeadersForAdmin(filters = {}) {
  await connectDB();
  await backfillLeaderPaymentStatuses();

  const leaders = await findUsersForExport(
    {
      role: "Leader",
      parentId: null,
    },
    filters,
    { statusMode: "adminLeader" }
  );

  return leaders.map(toManagedUserPayload);
}

export async function findAdminManagedUser(adminUserId, userId) {
  await connectDB();

  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  const target = await UserModel.findById(userId)
    .select("name role parentId isLocked LockReason")
    .lean();

  if (!target) {
    return null;
  }

  if (target.role === "Candidate") {
    return target.parentId?.toString() === adminUserId ? target : null;
  }

  if (target.role === "Leader") {
    if (!target.parentId) {
      return target;
    }

    const candidate = await UserModel.findOne({
      _id: target.parentId,
      role: "Candidate",
      parentId: adminUserId,
    })
      .select("_id")
      .lean();

    return candidate ? target : null;
  }

  return null;
}

export async function setManagedUserLock(userId, isLocked, reason = "") {
  await connectDB();

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isLocked,
        LockReason: isLocked ? reason || "Locked by admin" : null,
      },
    },
    {
      new: true,
      select: "name role parentId isLocked LockReason",
    }
  ).lean();

  return toLockPayload(updatedUser);
}
