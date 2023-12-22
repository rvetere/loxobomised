export enum LoxoneCategoryEnum {
  "jalousie" = "Beschattung",
  "ventilation" = "Lüftung",
  "light" = "Beleuchtung",
}
export type CommandType = "jalousie" | "ventilation" | "light";
export type ControllerType = "direct" | "overlay";
export type JalousieType = "jalousie" | "awning";
export type JalousieTimingVariant = "window" | "window-big" | "awning";
export type JalousieTilt = "closed" | "tilted" | "open";
