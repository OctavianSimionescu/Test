// src/factories/AdapterFactory.js

const RedmineAdapter = require("../adapters/RedmineAdapter")
const JiraAdapter = require("../adapters/JiraAdapter");
const { SOURCES } = require("../utils/utils");

class AdapterFactory {
  static createAdapter(source) {
    switch (source) {
      case SOURCES.redmine:
        return new RedmineAdapter();
      case SOURCES.jira:
        return new JiraAdapter();
      default:
        throw new Error(`Adapter for source ${source} not found`);
    }
  }
}
module.exports = { AdapterFactory };
