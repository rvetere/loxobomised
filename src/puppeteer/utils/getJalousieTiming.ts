export const LoggiaRolloTiming = 58 / 100;
export const WindowRolloTiming = 40 / 100;
export const MarkiseTiming = 19 / 100;

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
