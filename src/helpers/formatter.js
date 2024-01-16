/**
 * @param {Object} date
 * @returns {String}
 */
export function formatDate(date) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("ru-RU");
}

/**
 * @param {Date} date
 * @returns {String}
 */
export function fromCurrentDate(date) {
  if (!date) {
    return "";
  }

  const names = [
    "янв",
    "фев",
    "март",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  let result = date.getDate() + " " + names[date.getMonth()];

  if (date.getFullYear() !== new Date().getFullYear()) {
    result += " " + date.getFullYear();
  }

  return result;
}

export function getHumanQunatity(quantity) {
  // max 4 chars

  if (quantity >= 1000000) {
    if (quantity % 100000 === 0) {
      return quantity / 1000000 + "M";
    }
    return Math.floor(quantity / 1000000) + "M";
  }
  if (quantity >= 1000) {
    if (quantity % 100 === 0) {
      return quantity / 1000 + "K";
    }
    return Math.floor(quantity / 1000) + "K";
  }

  return quantity;
}
