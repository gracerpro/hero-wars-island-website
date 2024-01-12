export const TYPE_NODE = 0;
export const TYPE_START = 1;
export const TYPE_TOWN = 2;
export const TYPE_CHEST = 3;

export const STATUS_CREATED = 0;
export const STATUS_ON_MODERATION = 1;
export const STATUS_ACCEPTED_SUCCESS = 2;
export const STATUS_NOT_SURE = 3;

export function getStatusName(statusId) {
  let name = "";

  switch (statusId) {
    case STATUS_CREATED:
      name = "Создано";
      break;
    case STATUS_ON_MODERATION:
      name = "На модерации";
      break;
    case STATUS_NOT_SURE:
      name = "Есть сомнение";
      break;
    case STATUS_ACCEPTED_SUCCESS:
      name = "Принято";
      break;
  }

  return name;
}
