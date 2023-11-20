// src/models/journaldetail.js

const { Model, DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const Journal = require("./Journal");

class JournalDetail extends Model {}

JournalDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    journal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: Journal,
        key: "id",
      },
    },
    property: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    prop_key: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    old_value: {
      type: DataTypes.TEXT,
    },
    value: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "JournalDetail",
    tableName: "journaldetail",
    timestamps: false,
  }
);

module.exports = JournalDetail;
