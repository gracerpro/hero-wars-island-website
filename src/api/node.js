export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWN = 2;
export const TYPE_CHEST = 3;

export const STATUS_CREATED = 0;
export const STATUS_ON_MODERATION = 1;
export const STATUS_ACCEPTED_SUCCESS = 2;
export const STATUS_NOT_SURE = 3;

export function getStatusName(t, statusId) {
  const names = {
    [STATUS_CREATED]: t("common.created"),
    [STATUS_ON_MODERATION]: t("common.onModeration"),
    [STATUS_NOT_SURE]: t("common.haveDoubts"),
    [STATUS_ACCEPTED_SUCCESS]: t("common.accepted"),
  };

  return names[statusId] ? names[statusId] : "";
}
