// src/models/DataSource.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

class DataSource extends Model {}

DataSource.init({
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
    synced_at: {
        type: DataTypes.DATE
    },
    base_url: {
        type: DataTypes.STRING(255)
    },
    additional_config: {
        type: DataTypes.JSON
    },
}, {
    sequelize,
    modelName: 'DataSource',
    tableName: 'datasource',
    timestamps: false
});

module.exports = DataSource;
