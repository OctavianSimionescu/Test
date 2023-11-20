const { AdapterFactory } = require("../../factories/AdapterFactory");
const Issue = require("../../models/Issue");
const { HttpStatusCodes, put } = require("../../utils/utils");

module.exports = async (_, { storyId, position }) => {
  const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
  return await adapter.updateStoryPosition(storyId, position);
};
