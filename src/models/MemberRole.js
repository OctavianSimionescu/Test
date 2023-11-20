const { Model, DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const Member = require('./Member');
const Role = require('./Role');

class MemberRole extends Model {}

MemberRole.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    member_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Member,
            key: 'id'
        }
    },
    role_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Role,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'MemberRole',
    tableName: 'memberrole',
    timestamps: false
});

module.exports = MemberRole;
