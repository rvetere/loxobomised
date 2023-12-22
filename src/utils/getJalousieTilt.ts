import type { JalousieTilt } from "src/types";

export const getJalousieTilt = (queryTilt: string) => {
  switch (queryTilt.toLowerCase()) {
    case "0":
    case "closed":
      return "closed" as JalousieTilt;
    case "1":
    case "tilted":
      return "tilted" as JalousieTilt;
    case "2":
    case "open":
      return "open" as JalousieTilt;
    default:
      return "closed" as JalousieTilt;
  }
};
