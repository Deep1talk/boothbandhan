import biharDistrictVidhansabhaMap from "@/lib/data/bihar-district-vidhansabha.json";

export const BIHAR_DISTRICT_VIDHANSHABHA_MAP = biharDistrictVidhansabhaMap;
export const BIHAR_DISTRICTS = Object.keys(BIHAR_DISTRICT_VIDHANSHABHA_MAP);

export const GENDER_OPTIONS = ["Male", "Female", "Other"];
export const CASTE_CATEGORY_OPTIONS = ["General", "OBC", "EBC", "SC", "ST", "Minority", "Other"];
export const RELIGION_OPTIONS = ["Hindu", "Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Other"];
export const YES_NO_OPTIONS = ["Yes", "No"];

export function getVidhansabhaOptions(district) {
  if (!district) {
    return [];
  }

  return BIHAR_DISTRICT_VIDHANSHABHA_MAP[district] ?? [];
}
