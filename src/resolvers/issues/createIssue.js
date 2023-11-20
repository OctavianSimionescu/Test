// const Issue = require("../../models/Issue");
const { AdapterFactory } = require("../../factories/AdapterFactory");
const Issue = require("../../models/Issue");
const { HttpStatusCodes, post, SOURCES } = require("../../utils/utils");

module.exports = async (_, { issue }) => {
  const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
  const response = await adapter.createIssueOnSource(issue);
  return response;
};
