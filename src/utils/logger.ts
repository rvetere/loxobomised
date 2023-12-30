export const Logger = {
  active: false,
  log: (message: string) => {
    Logger.active && console.log(message);
  },
};
