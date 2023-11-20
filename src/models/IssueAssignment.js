// src/models/IssueAssignment.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const Issue = require('./Issue');
const User = require('./User');

class IssueAssignment extends Model {}

IssueAssignment.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    issue_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Issue,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    assigned_at: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'IssueAssignment',
    tableName: 'issueassignment',
    timestamps: false
});

module.exports = IssueAssignment;
