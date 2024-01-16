export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWN = 2;
export const TYPE_CHEST = 3;

export const STATUS_CREATED = 0;
export const STATUS_ON_MODERATION = 1;
export const STATUS_ACCEPTED_SUCCESS = 2;
export const STATUS_NOT_SURE = 3;

export function getStatusName(statusId) {
  const names = {
    [STATUS_CREATED]: "Создано",
    [STATUS_ON_MODERATION]: "На модерации",
    [STATUS_NOT_SURE]: "Есть сомнение",
    [STATUS_ACCEPTED_SUCCESS]: "Принято",
  };

  return names[statusId] ? names[statusId] : "";
}
