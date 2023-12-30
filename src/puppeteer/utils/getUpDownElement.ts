import type { ElementHandle } from "puppeteer";

export const getUpDownElement = async (container: ElementHandle<Node> | null) => {
  if (!container) {
    return {
      upButton: null,
      downButton: null,
    };
  }

  const downButtons = await container.$$(
    "path[d='M2.253 8.336a1 1 0 011.411-.083L12 15.663l8.336-7.41a1 1 0 011.328 1.494l-9 8a1 1 0 01-1.328 0l-9-8a1 1 0 01-.083-1.411z']"
  );
  const upButtons = await container.$$(
    "path[d='M11.336 6.253a1 1 0 011.328 0l9 8a1 1 0 01-1.328 1.494L12 8.337l-8.336 7.41a1 1 0 01-1.328-1.494l9-8z']"
  );
  const awningDownButtons = await container.$$(
    "path[d='M1.955.45A.5.5 0 012.452 0H4.5a.5.5 0 01.5.5V8H1L1.955.45zM3 11a2 2 0 002-2H1a2 2 0 002 2zm8-2a2 2 0 11-4 0h4zm6 0a2 2 0 11-4 0h4zm6 0a2 2 0 11-4 0h4zM7.5 0a.5.5 0 00-.5.5V8h4V.5a.5.5 0 00-.5-.5h-3zm6 0a.5.5 0 00-.5.5V8h4V.5a.5.5 0 00-.5-.5h-3zm6 0a.5.5 0 00-.5.5V8h4L22 .5a.5.5 0 00-.5-.5h-2zm-18 23.5A.5.5 0 012 23h20a.5.5 0 010 1H2a.5.5 0 01-.5-.5zm12.688-5.39a.5.5 0 11.624.78l-2.495 1.997a.498.498 0 01-.632.001L9.188 18.89a.5.5 0 11.624-.78l1.688 1.35V13.5a.5.5 0 011 0v5.96l1.688-1.35z']"
  );
  const awningUpButtons = await container.$$(
    "path[d='M1.886.342A.5.5 0 012.36 0H4.5a.5.5 0 01.5.5V3H1L1.886.342zM3 6a2 2 0 002-2H1a2 2 0 002 2zm8-2a2 2 0 11-4 0h4zm6 0a2 2 0 11-4 0h4zM7 .5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V3H7V.5zm6 0a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V3h-4V.5zM21 6a2 2 0 002-2h-4a2 2 0 002 2zm-1.5-6a.5.5 0 00-.5.5V3h4L22.114.342A.5.5 0 0021.64 0H19.5zM9.11 15.812a.5.5 0 00.702.078l1.688-1.35v5.96a.5.5 0 001 0v-5.96l1.688 1.35a.5.5 0 10.624-.78l-2.497-1.998a.498.498 0 00-.632.001L9.188 15.11a.5.5 0 00-.078.702zM2 23a.5.5 0 000 1h20a.5.5 0 000-1H2z']"
  );
  if (awningDownButtons.length || awningUpButtons.length) {
    console.log("ℹ️ Awning detected");
    return {
      upButton: awningUpButtons.length ? awningUpButtons[0] : null,
      downButton: awningDownButtons.length ? awningDownButtons[0] : null,
    };
  }
  return {
    upButton: upButtons.length ? upButtons[0] : null,
    downButton: downButtons.length ? downButtons[0] : null,
  };
};
