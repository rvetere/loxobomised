import type { JalousieTimingVariant } from "src/types";

export const LoggiaRolloTiming = 64 / 100;
export const WindowRolloTiming = 40 / 100;
export const MarkiseTiming = 19 / 100;

export const getJalousieTiming = (rolloType: JalousieTimingVariant) => {
  switch (rolloType) {
    case "window-big":
      return LoggiaRolloTiming;
    case "awning":
      return MarkiseTiming;
    default:
      return WindowRolloTiming;
  }
};
