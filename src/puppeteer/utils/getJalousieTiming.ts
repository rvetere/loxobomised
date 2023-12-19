export const LoggiaRolloTiming = 64 / 100;
export const WindowRolloTiming = 45 / 100;
export const MarkiseTiming = 20 / 100;

export type JalousieType = "Loggia" | "Window" | "Markise";

export const getJalousieTiming = (rolloType: JalousieType) => {
  switch (rolloType) {
    case "Loggia":
      return LoggiaRolloTiming;
    case "Markise":
      return MarkiseTiming;
    default:
      return WindowRolloTiming;
  }
};
