// src/models/IssueType.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const DataSource = require('./DataSource');

class IssueType extends Model {}

IssueType.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    data_source_id: {
        type: DataTypes.INTEGER,
        references: {
            model: DataSource,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'IssueType',
    tableName: 'issuetype',
    timestamps: false
});

module.exports = IssueType;
