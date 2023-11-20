const { AdapterFactory } = require("../../factories/AdapterFactory");
const Issue = require("../../models/Issue");
const { HttpStatusCodes, SOURCES } = require("../../utils/utils");

module.exports = async (_, { userId, startDate, endDate }) => {
  const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
  return await adapter.getActiveIssue(userId, startDate, endDate);
};
