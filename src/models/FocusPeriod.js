const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');

class FocusPeriod extends Model {}

FocusPeriod.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Optional description for the focus period'
    },
    data_source_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    external_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    modelName: 'focusperiod',
    tableName: 'focusperiod', 
    timestamps: false,
});

module.exports = FocusPeriod;