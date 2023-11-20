require("dotenv").config();
const createIssue = require('./issues/createIssue');
const updateIssue = require('./issues/updateIssue');
const updateIssueStatus = require('./issues/updateIssueStatus');
const updateIssuePosition = require('./issues/updateIssuePosition');
const updateStoryPosition = require('./stories/updateStoryPosition');
const updateFocusPeriod = require('./focusperiod/updateFocusPeriod');
const login = require('./auth/login');
const getProjects = require('./projects/getProjects');
const getProject = require('./projects/getProject');
const getIssues = require('./issues/getIssues');
// const getSprint = require('./sprint/getSprint');
const getFocusPeriod = require('./focusperiod/getFocusPeriod');
const getStories = require('./stories/getStories');
const getActiveIssue = require('./issues/getActiveIssue');
const getJournals = require('./journal/getJournals');

const resolvers = {
  Mutation: {
    createIssue,
    updateIssue,
    updateIssueStatus,
    updateIssuePosition,
    updateStoryPosition,
    updateFocusPeriod
  },
  Query: {
    login,
    getProjects,
    getFocusPeriod,
    getStories,
    getProject,
    getActiveIssue,
    getJournals
  },
};

module.exports = resolvers;
