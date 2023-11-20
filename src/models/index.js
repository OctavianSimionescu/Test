const User = require("./User");
const Project = require("./Project");
const Status = require("./Status");
const Issue = require("./Issue");
const IssueAssignment = require("./IssueAssignment");
const DataSource = require("./DataSource");
const IssueType = require("./IssueType");
const Role = require("./Role");
const Member = require("./Member");
const MemberRole = require("./MemberRole");
const Sprint = require("./Sprint");
const FocusPeriod = require("./FocusPeriod");
const Journal = require("./Journal");
const JournalDetail = require("./JournalDetail");
const JournalActivity = require("./JournalActivity");

Issue.hasMany(IssueAssignment, {
  foreignKey: "issue_id",
  as: "assignments",
});

Issue.hasMany(Journal, {
  foreignKey: "journalized_id",
  constraints: false,
  scope: {
    journalized_type: "Issue",
  },
  as: "journals",
});

Issue.hasMany(Issue, {
  foreignKey: "parent_id",
  as: "issues",
});

Project.hasMany(Journal, {
  foreignKey: "journalized_id",
  constraints: false,
  scope: {
    journalized_type: "Project",
  },
  as: "journals",
});

Project.hasMany(Member, {
  foreignKey: "project_id",
  as: "members",
});

Project.hasMany(Issue, {
  foreignKey: "project_id",
  as: "stories",
});

Project.hasMany(Sprint, {
  foreignKey: "project_id",
  as: "sprints",
});

Member.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Journal.belongsTo(Issue, {
  foreignKey: "journalized_id",
  constraints: false,
  as: "journalized_issue",
});

Journal.belongsTo(Project, {
  foreignKey: "journalized_id",
  constraints: false,
  as: "journalized_project",
});

// A Journal has many JournalDetails
Journal.hasMany(JournalDetail, {
  foreignKey: "journal_id",
  as: "details",
});

// A JournalDetail belongs to one Journal
JournalDetail.belongsTo(Journal, {
  foreignKey: "journal_id",
  as: "journal",
});

Journal.hasOne(JournalActivity, {
  foreignKey: "journal_id",
  as: "activity",
});

JournalActivity.belongsTo(Journal, {
  foreignKey: "journal_id",
  as: "journal",
});

const models = {
  User,
  Project,
  Sprint,
  Status,
  Issue,
  IssueAssignment,
  DataSource,
  IssueType,
  Role,
  Member,
  MemberRole,
  FocusPeriod,
  Journal,
  JournalDetail,
};

module.exports = { models };
