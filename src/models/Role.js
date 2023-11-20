// src/models/Role.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const DataSource = require('./DataSource');

class Role extends Model {}

Role.init({
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
    modelName: 'Role',
    tableName: 'role',
    timestamps: false
});

module.exports = Role;
