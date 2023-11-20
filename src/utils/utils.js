const { default: axios } = require("axios");

const HttpStatusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

const ISSUE_TRACKERS = {
  BUG: 1,
  FEATURE: 2,
  SUPPORT: 3,
  USER_STORY: 4,
  USER_STORY_CLOSED: 5,
  MEETING: 6,
  TEST_CREATE: 7,
  TEST_ANALYSIS: 9,
  PLANNING: 10,
  // EPIC: 10,
  CODE_REVIEW: 14,
};

const ISSUE_STATUS = {
  NEW: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  ON_HOLD: 7,
};

const SOURCES = {
  redmine: 1,
  jira: 2,
};

const SERVER_EVENT_TYPES = {
  UPDATE_ISSUES: "UPDATE_ISSUES",
  UPDATE_PROJECTS: "UPDATE_PROJECTS",
  UPDATE_STORIES: "UPDATE_STORIES",
  UPDATE_EVERYTHING: "UPDATE_EVERYTHING",
  UPDATE_FOCUS_PERIOD: "UPDATE_FOCUS_PERIOD",
  UPDATE_MEMBERS: "UPDATE_MEMBERS",
  UPDATE_SPRINTS: "UPDATE_SPRINTS",
};

const REDMINE_CRUD_KEYS = {
  CRU_PROJECTS_KEY: "redmine.cru_projects_key",
  CRU_ISSUES_KEY: "redmine.cru_issues_key",
  CRU_SPRINTS_KEY: "redmine.cru_sprints_key",
  CRU_MEMBERS_KEY: "redmine.cru_members_key",
  D_PROJECTS_KEY: "redmine.d_projects_key",
  D_ISSUES_KEY: "redmine.d_issues_key",
  D_SPRINTS_KEY: "redmine.d_sprints_key",
  D_MEMBERS_KEY: "redmine.d_members_key",
  CRU_PBIS_KEY: "redmine.cru_pbis_key",
  CRU_JOURNAL_KEY: "redmine.cru_journal_key",
};

const JOURNAL_DETAIL_KEYS = {
  STATUS_ID: "status_id",
  TRACKER_ID: "tracker_id",
  ASSIGNED_TO_ID: "assigned_to_id",
  PRIORITY_ID: "priority_id",
  SUBJECT: "subject",
  DESCRIPTION: "description",
  START_DATE: "start_date",
  ESTIMATED_HOURS: "estimated_hours",
  SPENT_HOURS: "spent_hours",
};

const JOURNAL_TYPE = {
  ISSUE: "Issue",
  PROJECT: "Project",
};

const JORUNAL_ACTIVITY_TYPES = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  STATUS_UPDATE: "STATUS_UPDATE",
  ASSIGNMENT_UPDATE: "ASSIGNMENT_UPDATE",
  ESTIMATED_HOURS_UPDATE: "ESTIMATED_HOURS_UPDATE",
  SPENT_HOURS_UPDATE: "SPENT_HOURS_UPDATE",
  TRACKER_UPDATE: "TRACKER_UPDATE",
  SUBJECT_UPDATE: "SUBJECT_UPDATE",
  DESCRIPTION_UPDATE: "DESCRIPTION_UPDATE",
  DONE_RATIO_UPDATE: "DONE_RATIO_UPDATE",
};

const LOGIN_ORIGIN = {
  REDMINE: "REDMINE",
  MICROSOFT: "MICROSOFT",
};

const GAP_SIZE = 100; // Define a constant for the gap size of issue positions

const get = (endpoint, headers) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(endpoint, { headers });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });
};

const post = (endpoint, body, headers) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post(endpoint, body, { headers });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

const put = (endpoint, body, headers) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.put(endpoint, body, { headers });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

const convertRedmineHoursToSeconds = (hours) => {
  if (!hours) return 0;
  return hours * 3600;
};

const converToRedmineHours = (seconds) => {
  if (!seconds) return 0;
  return seconds / 3600;
};

const getSupportedValueForKeyAndValue = (key, value) => {
  switch (key) {
    case "estimated_hours":
      return convertRedmineHoursToSeconds(value);
    case "spent_hours":
      return convertRedmineHoursToSeconds(value);
    default:
      return value;
  }
};

module.exports = {
  HttpStatusCodes,
  convertRedmineHoursToSeconds,
  converToRedmineHours,
  getSupportedValueForKeyAndValue,
  LOGIN_ORIGIN,
  ISSUE_TRACKERS,
  ISSUE_STATUS,
  SOURCES,
  GAP_SIZE,
  SERVER_EVENT_TYPES,
  JORUNAL_ACTIVITY_TYPES,
  JOURNAL_DETAIL_KEYS,
  JOURNAL_TYPE,
  REDMINE_CRUD_KEYS,
  get,
  post,
  put,
};
