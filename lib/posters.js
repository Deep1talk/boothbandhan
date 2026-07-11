export const DEFAULT_POSTER_NAME_COLOR = "#1f2937";
export const DEFAULT_POSTER_TAGLINE_COLOR = "#7c2d12";
export const DEFAULT_POSTER_CONTACT_COLOR = "#1f2937";
export const DEFAULT_POSTER_CARD_COLOR = "#f6c453";
export const DEFAULT_POSTER_STRIP_COLOR = "#0b0b0b";
export const DEFAULT_POSTER_FONT = "Assistant";
export const DEFAULT_POSTER_LOGO = "/assests/images/logo.webp";
export const DEFAULT_POSTER_SIZE = {
  width: 1080,
  height: 1350,
};

export const POSTER_FONT_OPTIONS = [
  { label: "Assistant", value: "Assistant" },
  { label: "Georgia", value: "Georgia" },
  { label: "Trebuchet", value: "Trebuchet MS" },
  { label: "Verdana", value: "Verdana" },
];

export const SAMPLE_POSTER_PROFILE = {
  name: "Aman Kumar",
  greetingTagline: "Block President, Jan Suraj Party, East Champaran",
  phone: "9876543210",
  whatsappNumber: "9876543210",
  instagramHandle: "@amanjansuraj",
  twitterHandle: "@amanjansuraj",
  facebookHandle: "Aman Kumar",
  posterPhoto: "",
  avatar: "",
  posterPhotoScale: 1,
  posterPhotoOffsetX: 0,
  posterPhotoOffsetY: 0,
};

export function slugifyFestivalTitle(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeDateValue(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? new Date(value) : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function toScheduleStart(value) {
  const date = normalizeDateValue(value);

  if (!date) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

export function toScheduleEnd(value) {
  const date = normalizeDateValue(value);

  if (!date) {
    return null;
  }

  date.setHours(23, 59, 59, 999);
  return date;
}

export function isTemplateLive(template, now = new Date()) {
  if (!template?.isActive) {
    return false;
  }

  const current = normalizeDateValue(now) || new Date();
  const scheduleStart = toScheduleStart(template.startDate);
  const scheduleEnd = toScheduleEnd(template.endDate);
  const hasStarted = !scheduleStart || scheduleStart <= current;
  const hasNotEnded = !scheduleEnd || scheduleEnd >= current;

  return hasStarted && hasNotEnded;
}

export function normalizeFestivalTemplate(template) {
  if (!template) {
    return null;
  }

  return {
    id: template._id?.toString?.() || template.id,
    title: template.title,
    slug: template.slug,
    backgroundImage: template.backgroundImage,
    backgroundImagePublicId: template.backgroundImagePublicId,
    cardBackgroundColor: template.cardBackgroundColor || DEFAULT_POSTER_CARD_COLOR,
    contactStripBackgroundColor:
      template.contactStripBackgroundColor || DEFAULT_POSTER_STRIP_COLOR,
    nameTextColor: template.nameTextColor || DEFAULT_POSTER_NAME_COLOR,
    taglineTextColor: template.taglineTextColor || DEFAULT_POSTER_TAGLINE_COLOR,
    contactTextColor: template.contactTextColor || DEFAULT_POSTER_CONTACT_COLOR,
    fontFamily: template.fontFamily || DEFAULT_POSTER_FONT,
    isActive: Boolean(template.isActive),
    startDate: template.startDate ? new Date(template.startDate).toISOString() : null,
    endDate: template.endDate ? new Date(template.endDate).toISOString() : null,
    createdAt: template.createdAt ? new Date(template.createdAt).toISOString() : null,
    updatedAt: template.updatedAt ? new Date(template.updatedAt).toISOString() : null,
    isCurrentlyLive: isTemplateLive(template),
  };
}

export function normalizePosterProfile(user) {
  if (!user) {
    return null;
  }

  const avatar = user.avatar || "";
  const posterPhoto = user.posterPhoto || avatar;

  return {
    id: user._id?.toString?.() || user.id,
    name: user.name || "",
    greetingTagline: user.greetingTagline || "",
    phone: user.phone || "",
    whatsappNumber: user.whatsappNumber || "",
    instagramHandle: user.instagramHandle || "",
    twitterHandle: user.twitterHandle || "",
    facebookHandle: user.facebookHandle || "",
    posterPhoto,
    avatar,
    posterPhotoScale: Number.isFinite(Number(user.posterPhotoScale)) ? Number(user.posterPhotoScale) : 1,
    posterPhotoOffsetX: Number.isFinite(Number(user.posterPhotoOffsetX)) ? Number(user.posterPhotoOffsetX) : 0,
    posterPhotoOffsetY: Number.isFinite(Number(user.posterPhotoOffsetY)) ? Number(user.posterPhotoOffsetY) : 0,
  };
}
