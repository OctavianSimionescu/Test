const { AdapterFactory } = require("../../factories/AdapterFactory");
const Issue = require("../../models/Issue");
const { HttpStatusCodes, ISSUE_STATUS: ISSUE_STATUSES } = require("../../utils/utils");

module.exports = async (_, { issueId, statusId, userId }) => {
    const adapter = AdapterFactory.createAdapter(+process.env.DATA_SOURCE);
    const resposne = await adapter.updateIssueStatusOnSource(issueId, statusId, userId);
    return resposne;
};

