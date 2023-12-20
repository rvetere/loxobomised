import { ElementHandle } from "puppeteer";
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
    return 0;
  } else if (jalStatsShading !== 20) {
    console.log("ℹ️ Jalousie is tilted");
    return 1;
  } else if (jalStatsHorizontal !== 20) {
    console.log("ℹ️ Jalousie is open");
    return 2;
  }

  console.log("🚨 No idea!");
  return 0;
};
