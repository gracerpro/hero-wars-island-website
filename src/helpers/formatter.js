/**
 * @param {Object} date
 * @returns {String}
 */
export function formatDate(date) {
  if (!date) {
    return null;
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
