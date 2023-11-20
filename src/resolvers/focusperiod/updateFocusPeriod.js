const { AdapterFactory } = require("../../factories/AdapterFactory");
const FocusPeriod = require("../../models/FocusPeriod");
const { HttpStatusCodes, SOURCES } = require("../../utils/utils");

module.exports = async (_, { focusPeriod }) => {
  const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
  return await adapter.updateFocusPeriod(focusPeriod);
};