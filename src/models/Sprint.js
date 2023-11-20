// src/models/Sprint.js

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const DataSource = require("./DataSource");
const Project = require("./Project");

class Sprint extends Model {}

Sprint.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "Sprint",
    tableName: "sprint",
    timestamps: false,
  }
);

module.exports = Sprint;
