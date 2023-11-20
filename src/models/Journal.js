// src/models/journal.js

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/db");

class Journal extends Model {}

Journal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    journalized_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    journalized_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    external_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    data_source_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Journal",
    tableName: "journal",
    timestamps: false,
  }
);

module.exports = Journal;
