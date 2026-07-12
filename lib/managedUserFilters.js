export const MANAGED_USER_PAGE_SIZE = 20;

export const INITIAL_MANAGED_USER_FILTERS = Object.freeze({
  search: "",
  bloodGroup: "",
  status: "",
  district: "",
  vidhansabha: "",
  block: "",
  startDate: "",
  endDate: "",
});

export function createManagedUserFilters() {
  return {
    search: "",
    bloodGroup: "",
    status: "",
    district: "",
    vidhansabha: "",
    block: "",
    startDate: "",
    endDate: "",
  };
}

export function buildManagedUserQueryParams({ page = 1, pageSize = MANAGED_USER_PAGE_SIZE, filters = {} } = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      query.set(key, value.trim());
    }
  });

  return query;
}

export function buildManagedUserFilterQueryParams(filters = {}) {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      query.set(key, value.trim());
    }
  });

  return query;
}

export function parseManagedUserListParams(searchParams) {
  const pageValue = Number.parseInt(searchParams.get("page") || "1", 10);
  const pageSizeValue = Number.parseInt(
    searchParams.get("pageSize") || String(MANAGED_USER_PAGE_SIZE),
    10
  );

  return {
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    pageSize:
      Number.isFinite(pageSizeValue) && pageSizeValue > 0
        ? Math.min(pageSizeValue, MANAGED_USER_PAGE_SIZE)
        : MANAGED_USER_PAGE_SIZE,
    filters: {
      search: searchParams.get("search") || "",
      bloodGroup: searchParams.get("bloodGroup") || "",
      status: searchParams.get("status") || "",
      district: searchParams.get("district") || "",
      vidhansabha: searchParams.get("vidhansabha") || "",
      block: searchParams.get("block") || "",
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    },
  };
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

export function filterManagedUsers(items, filters) {
  const searchTerm = filters.search.trim().toLowerCase();
  const blockTerm = filters.block.trim().toLowerCase();

  return items.filter((item) => {
    const itemDayKey = getIndiaDayKey(item.createdAt);
    const matchesSearch =
      !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm) ||
      item.phone?.toLowerCase().includes(searchTerm) ||
      item.idNo?.toLowerCase().includes(searchTerm) ||
      item.block?.toLowerCase().includes(searchTerm);
    const matchesBloodGroup =
      !filters.bloodGroup || item.bloodGroup === filters.bloodGroup;
    const matchesStatus =
      !filters.status ||
      (filters.status === "Active" && !item.isLocked) ||
      (filters.status === "Pending" && !item.isEmailVerified);
    const matchesDistrict = !filters.district || item.district === filters.district;
    const matchesVidhansabha =
      !filters.vidhansabha || item.vidhansabha === filters.vidhansabha;
    const matchesBlock = !blockTerm || item.block?.toLowerCase().includes(blockTerm);
    const matchesStartDate = !filters.startDate || itemDayKey >= filters.startDate;
    const matchesEndDate = !filters.endDate || itemDayKey <= filters.endDate;

    return (
      matchesSearch &&
      matchesBloodGroup &&
      matchesStatus &&
      matchesDistrict &&
      matchesVidhansabha &&
      matchesBlock &&
      matchesStartDate &&
      matchesEndDate
    );
  });
}
