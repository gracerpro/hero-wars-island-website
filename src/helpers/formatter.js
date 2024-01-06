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
