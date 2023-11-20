// src/models/Status.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const DataSource = require('./DataSource');

class Status extends Model {}

Status.init({
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
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    sequelize,
    modelName: 'Status',
    tableName: 'status',
    timestamps: false
});

module.exports = Status;
