const { AdapterFactory } = require("../../factories/AdapterFactory");
const { SOURCES } = require("../../utils/utils");


const syncWithRedmine = async () => {
    try {
        const adapter = AdapterFactory.createAdapter(SOURCES.redmine)
        await adapter.syncUsers();
        await adapter.syncProjects();
        await adapter.syncSprints();
        await adapter.syncIssueTypes();
        await adapter.syncStatuses();
        await adapter.syncRoles();
        await adapter.syncMembers();
        await adapter.syncIssues();
        await adapter.syncIssuesJournals();
    } catch (error) {
        console.log(error);
    }
}

module.exports = { syncWithRedmine };
