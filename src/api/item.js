export const TYPE_TYPE_RECIPES = 1;
export const TYPE_TYPE_CONSUMABLE = 2;
export const TYPE_TYPE_COIN = 3;
export const TYPE_PATTERN = 4;
export const TYPE_FRAGMENT = 5;
export const TYPE_SOUL_STONE = 6;
export const TYPE_TYPE_EQUIPMENT = 7;

export function getLabelsByTypes(t) {
  return {
    [TYPE_TYPE_EQUIPMENT]: t("common.equipment"),
    [TYPE_TYPE_RECIPES]: t("common.recipes"),
    [TYPE_TYPE_CONSUMABLE]: t("common.consumable"),
    [TYPE_TYPE_COIN]: t("common.coins"),
    [TYPE_PATTERN]: t("common.pattern", 2),
    [TYPE_FRAGMENT]: t("common.fragment", 2),
    [TYPE_SOUL_STONE]: t("common.soulStones"),
  };
}
