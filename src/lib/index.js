const { controlJalousie } = require("./controlJalousie");
const { controlJalousieWithAction } = require("./controlJalousieWithAction");
const { clickActionOfTitle } = require("./clickActionOfTitle");
const { clickUpDownOfTitle } = require("./clickUpDownOfTitle");
const { clickPlusMinusOfTitle } = require("./clickPlusMinusOfTitle");
const { clickButtonByText } = require("./clickButtonByText");
const { clickOnParent } = require("./clickOnParent");
const { getContainer } = require("./getContainer");
const { getPageInPool } = require("./getPageInPool");
const { navigate } = require("./navigate");
const { sleep } = require("./sleep");

module.exports = {
  controlJalousie,
  controlJalousieWithAction,
  clickUpDownOfTitle,
  clickActionOfTitle,
  clickPlusMinusOfTitle,
  clickButtonByText,
  clickOnParent,
  getContainer,
  getPageInPool,
  navigate,
  sleep,
};
