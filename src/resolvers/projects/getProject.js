const { AdapterFactory } = require("../../factories/AdapterFactory");

module.exports = async (
  _,
  { startDate, endDate, userId, projectId },
  context
) => {
  const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
  return await adapter.getProject(startDate, endDate, userId, projectId);
};
