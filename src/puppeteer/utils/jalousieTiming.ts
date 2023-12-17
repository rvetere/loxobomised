export const LoggiaRolloTiming = 59 / 100;
export const WindowRolloTiming = 40 / 100;
export const MarkiseTiming = 20 / 100;

export type RolloType = "Loggia" | "Window" | "Markise";

export const getTiming = (rolloType: RolloType) => {
  switch (rolloType) {
    case "Loggia":
      return LoggiaRolloTiming;
    case "Markise":
      return MarkiseTiming;
    default:
      return WindowRolloTiming;
  }
};
