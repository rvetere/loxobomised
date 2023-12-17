import { Page } from "puppeteer";
import { getContainer } from "./getContainer";
import { clickActionOfTitle } from "./clickActionOfTitle";
import { getDataPercent } from "./getDataPercent";
import { toPositive } from "src/utils/toPositive";
import { getTiming } from "./jalousieTiming";

interface ControlJalousieWithActionProps {
  page: Page | null;
  room: string;
  buttonGroupIndex: number;
  percentToSet: number;
  actionUp?: string;
  actionDown?: string;
  callback?: (room: string, buttonGroupIndex: number) => void;
}

export const controlJalousieWithAction = async ({
  page,
  room,
  buttonGroupIndex,
  percentToSet,
  actionUp = "Fully In",
  actionDown = "Fully Out",
  callback = () => {},
}: ControlJalousieWithActionProps) => {
  const container = await getContainer(page, room, buttonGroupIndex);
  if (!container) {
    return 0;
  }

  const currentPercent = await getDataPercent(container, "Fully extended");
  const steps = percentToSet - currentPercent;
  const action = steps > 0 ? actionDown : actionUp;

  console.log("   Run controlJalousieWithAction", {
    room: `${room} [${buttonGroupIndex}]`,
    steps,
  });

  if (percentToSet === 0) {
    await clickActionOfTitle(page, room, buttonGroupIndex, action);
  } else if (toPositive(steps) > 3) {
    await clickActionOfTitle(page, room, buttonGroupIndex, action);

    // calculate exact delay to reach "percentToSet"
    const delay = Math.floor(toPositive(steps) * getTiming("Markise") * 1000);

    // wait until jalousie is in position
    setTimeout(async () => {
      console.log(`   Run stopAndMoveToFinalPosition (${buttonGroupIndex})`);
      await clickActionOfTitle(page, room, buttonGroupIndex, action);
      callback(room, buttonGroupIndex);
    }, delay);

    return delay;
  }

  callback(room, buttonGroupIndex);
  return 0;
};
