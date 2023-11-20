const { buildSchema } = require("graphql");
const { readFileSync } = require("fs");
const { join } = require("path");

const loadGqlFile = (path) => readFileSync(join(__dirname, path), "utf8");

// Load each individual .graphql file
const userType = loadGqlFile("./types/user.graphql");
const projectType = loadGqlFile("./types/project.graphql");
const memberType = loadGqlFile("./types/member.graphql");
const issueType = loadGqlFile("./types/issue.graphql");
const focusPeriodType = loadGqlFile("./types/focusPeriod.graphql");
const storyType = loadGqlFile("./types/story.graphql");
const sprintType = loadGqlFile("./types/sprint.graphql");
const storyPayload = loadGqlFile("./types/storyPayload.graphql");
const issuePayload = loadGqlFile("./types/issuePayload.graphql");
const assignmentType = loadGqlFile("./types/assignment.graphql");
const activeIssuePayload = loadGqlFile("./types/activeIssuePayload.graphql");
const authPayloadType = loadGqlFile("./types/authPayload.graphql");
const projectPayloadType = loadGqlFile("./types/projectPayload.graphql");

const journalType = loadGqlFile("./types/journal.graphql");
const journalDetailType = loadGqlFile("./types/journalDetail.graphql");
const journalActivityType = loadGqlFile("./types/journalActivity.graphql");
const journalPayloadType = loadGqlFile("./types/journalPayload.graphql");

const updateIssuePayloadType = loadGqlFile(
  "./types/updateIssuePayload.graphql"
);
const updateFocusPeriodPayloadType = loadGqlFile("./types/updateFocusPeriodPayload.graphql");
const metadataType = loadGqlFile("./types/metadata.graphql");
const idType = loadGqlFile("./types/id.graphql");
const defaultResponeType = loadGqlFile("./types/defaultResponse.graphql");
const createIssuePayloadType = loadGqlFile(
  "./types/createIssuePayload.graphql"
);
const storiesPayloadType = loadGqlFile("./types/storiesPayload.graphql");
const issuesPayloadType = loadGqlFile("./types/issuesPayload.graphql");

const queryType = loadGqlFile("./query/query.graphql");
const mutationType = loadGqlFile("./mutation/mutation.graphql");

const typeDefs =
  userType +
  projectType +
  memberType +
  issueType +
  storyType +
  storyPayload +
  sprintType +
  issuePayload +
  assignmentType +
  authPayloadType +
  updateIssuePayloadType +
  updateFocusPeriodPayloadType +
  focusPeriodType +
  activeIssuePayload +
  projectPayloadType +
  createIssuePayloadType +
  issuesPayloadType +
  storiesPayloadType +
  metadataType +
  journalType +
  journalDetailType +
  journalActivityType +
  journalPayloadType +
  idType +
  defaultResponeType +
  queryType +
  mutationType;

const schema = buildSchema(typeDefs);

module.exports = schema;
