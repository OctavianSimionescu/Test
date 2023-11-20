const { AdapterFactory } = require("../../factories/AdapterFactory");

module.exports = async (_, { startDate, endDate, userId }, context) => {
    const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
    return await adapter.getProjects(startDate, endDate, userId);
};
