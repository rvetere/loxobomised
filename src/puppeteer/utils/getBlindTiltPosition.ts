import type { ElementHandle } from "puppeteer";
import type { JalousieTilt } from "src/types";
import { toPositive } from "src/utils/toPositive";

const getStatsTransform = async (container: ElementHandle<Node>, id: string) => {
  const stats = await container.$$eval(`#${id}`, (els) =>
    els.map((el) => el.getAttribute("transform"))
  );
  return toPositive(stats[0] ? parseFloat(stats[0].split(",")[1]) : -20);
};

export const getBlindTiltPosition = async (container: ElementHandle<Node>) => {
  const jalStatsShading = await getStatsTransform(container, "jal_slats_shading");
  const jalStatsHorizontal = await getStatsTransform(container, "jal_slats_horizontal");
  const jalStatsVertical = await getStatsTransform(container, "jal_slats_vertical");

  if (jalStatsVertical === 0) {
    console.log("ℹ️ Jalousie is closed");
    return "closed" as JalousieTilt;
  } else if (jalStatsShading !== 20) {
    console.log("ℹ️ Jalousie is tilted");
    return "tilted" as JalousieTilt;
  } else if (jalStatsHorizontal !== 20) {
    console.log("ℹ️ Jalousie is open");
    return "open" as JalousieTilt;
  }

  return "closed" as JalousieTilt;
};
