// src/models/JournalActivity.js

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const Journal = require("./Journal");  // Import the Journal model

class JournalActivity extends Model {}

JournalActivity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    journal_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Journal,
        key: 'id',
      },
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "JournalActivity",
    tableName: "journalactivity",
    timestamps: false,
  }
);

module.exports = JournalActivity;
