export function formatDate(date: Date): string {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("ru-RU");
}

export function fromCurrentDate(date?: Date | null, locale = null): string {
  if (!date) {
    return "";
  }

  const now = new Date();
  let result =
    date.getDate() + " " + date.toLocaleString(locale ? locale : "default", { month: "short" });

  if (date.getFullYear() !== now.getFullYear()) {
    result += " " + date.getFullYear();
  }

  return result;
}

export function getHumanQuantity(quantity: number): string {
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

  return quantity.toString();
}

export function getHumanSize(sizeInBytes: number, precision = 2): string {
  if (sizeInBytes < 1024) {
    return sizeInBytes + " b";
  }
  // 1048576 = 1 Mb
  if (sizeInBytes < 1048576) {
    return (sizeInBytes / 1024).toFixed(precision) + " kb";
  }

  return (sizeInBytes / 1024 / 1024).toFixed(precision) + " mb";
}
