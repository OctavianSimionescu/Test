const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./User');
const Project = require('./Project');
const Role = require('./Role');

class Member extends Model {}

Member.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Project,
            key: 'id'
        }
    },
}, {
    sequelize,
    modelName: 'Member',
    tableName: 'member',
    timestamps: false
});

module.exports = Member;
