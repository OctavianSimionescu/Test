// src/models/User.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const DataSource = require('./DataSource');

class User extends Model {}

User.init({
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
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    display_name: {
        type: DataTypes.STRING(255)
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false  // Default is not an admin
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false
});

module.exports = User;
