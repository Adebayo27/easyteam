const pg = require("pg");
module.exports = {
  HOST: "ep-small-bonus-67949136.us-east-1.aws.neon.tech",
  USER: "adekoya.adebayojubril",
  PASSWORD: "QjM1JYu3ltRn",
  DB: "easy_team",
  dialect: "postgres",
  dialectOptions: {
    ssl: true,
  },
  dialectModule: pg,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
