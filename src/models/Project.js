// src/models/Project.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const DataSource = require('./DataSource');

class Project extends Model {}

Project.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    data_source_id: {
        type: DataTypes.INTEGER,
        references: {
            model: DataSource,
            key: 'id'
        }
    },
    external_id: {
        type: DataTypes.STRING(255)
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    created_on: {
        type: DataTypes.DATE
    },
    updated_on: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'Project',
    tableName: 'project',
    timestamps: false
});

module.exports = Project;
