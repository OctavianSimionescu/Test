// src/models/Issue.js

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const DataSource = require("./DataSource");
const Project = require("./Project");
const Sprint = require("./Sprint");
const Status = require("./Status");
const IssueType = require("./IssueType");

class Issue extends Model {}

Issue.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    data_source_id: {
      type: DataTypes.INTEGER,
      references: {
        model: DataSource,
        key: "id",
      },
    },
    external_id: {
      type: DataTypes.STRING(255),
    },
    project_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Project,
        key: "id",
      },
    },
    sprint_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Sprint,
        key: "id",
      },
    },
    status_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Status,
        key: "id",
      },
    },
    parent_id: {
      type: DataTypes.INTEGER,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    created_on: {
      type: DataTypes.DATE,
    },
    updated_on: {
      type: DataTypes.DATE,
    },
    issue_type_id: {
      type: DataTypes.INTEGER,
      references: {
        model: IssueType,
        key: "id",
      },
    },
    position: {
      type: DataTypes.DOUBLE,
      allowNull: true, // Allow null for now, can be updated later if needed
      defaultValue: 0,
    },
    spent_time: {
      type: DataTypes.DOUBLE,
      allowNull: true, // Allow null for now, can be updated later if needed
      defaultValue: 0,
    },
    estimated_time: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    done_ratio: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for now, can be updated later if needed
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Issue",
    tableName: "issue",
    timestamps: true,
  }
);

module.exports = Issue;
