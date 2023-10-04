const Sequelize = require('sequelize');
// import models
const CardinalC2Invoice = require('./cardinalC2Invoice');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

db.sequelize = sequelize;

db.CardinalC2Invoice = CardinalC2Invoice;

CardinalC2Invoice.initiate(sequelize);

CardinalC2Invoice.associate(db);

module.exports = db;
