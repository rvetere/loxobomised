const { controlJalousie } = require("./controlJalousie");
const { controlJalousieWithAction } = require("./controlJalousieWithAction");
const { clickActionOfCategory } = require("./clickActionOfCategory");
const { clickUpDownOfCategory } = require("./clickUpDownOfCategory");
const { clickPlusMinusOfCategory } = require("./clickPlusMinusOfCategory");
const { clickButtonByText } = require("./clickButtonByText");
const { clickOnParent } = require("./clickOnParent");
const { getPageInPool } = require("./getPageInPool");
const { navigateToRoom } = require("./navigateToRoom");
const { sleep } = require("./sleep");

module.exports = {
  controlJalousie,
  controlJalousieWithAction,
  clickUpDownOfCategory,
  clickActionOfCategory,
  clickPlusMinusOfCategory,
  clickButtonByText,
  clickOnParent,
  getPageInPool,
  navigateToRoom,
  sleep,
};
