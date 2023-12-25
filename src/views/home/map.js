import { STATUS_ACCEPTED_SUCCESS, TYPE_START } from "@/api/HeroClient";

export const TRANSLATE_X = 6;
export const TRANSLATE_Y = 6;
export const EVENT_CHANGE_TRANSLATE = "change-translate";

export const DELTA_SCALE = 0.1;
export const EVENT_CHANGE_SCALE = "change-scale";

export function canSelectNode(node) {
  return (
    node.statusId === STATUS_ACCEPTED_SUCCESS && node.typeId !== TYPE_START
  );
}
