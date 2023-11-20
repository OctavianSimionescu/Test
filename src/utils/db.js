const {Sequelize} = require('sequelize');

const password = 'myrootpassword';
const encodedPassword = encodeURIComponent(password);

const sequelize = new Sequelize('mysql://root:' + encodedPassword+ '@127.0.0.1:3004/pmp', {logging: console.log});

module.exports = sequelize;