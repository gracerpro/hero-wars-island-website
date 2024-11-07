import { fromCurrentDate } from "@/helpers/formatter";
import { useI18n } from "@/i18n";

const { t } = useI18n();

/**
 * @param {Object} region
 * @returns {String}
 */
export function getRegionTitle(region) {
  if (!region.isVisible) {
    return t("common.partTemporalyUnavailable");
  }

  return (
    t("page.home.thePartNumber", { n: region.number }) +
    (region.startAt ? ", " + t("common.startAt") + " " + fromCurrentDate(region.startAt) : "")
  );
}
