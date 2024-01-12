export const TYPE_TYPE_SCROLL = 1;
export const TYPE_TYPE_SPEND = 2;
export const TYPE_TYPE_COIN = 3;
export const TYPE_PATTERN = 4;
export const TYPE_FRAGMENT = 5;
export const TYPE_STONE = 6;
export const TYPE_TYPE_EQUIPMENT = 7;

export function getLabelsByTypes() {
  return {
    [TYPE_TYPE_EQUIPMENT]: "Экипировка",
    [TYPE_TYPE_SCROLL]: "Свитки",
    [TYPE_TYPE_SPEND]: "Расходуемые",
    [TYPE_TYPE_COIN]: "Монеты",
    [TYPE_PATTERN]: "Узоры",
    [TYPE_FRAGMENT]: "Фрагменты",
    [TYPE_STONE]: "Камни душ",
  };
}
