export const Logger = {
  active: true,
  log: (message: string) => {
    Logger.active && console.log(message);
  },
};
