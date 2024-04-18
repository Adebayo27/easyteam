const sequelize = require("../config/app-config.js");
const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
db.users = require("./user.js")(sequelize, Sequelize);
db.products = require("./product.js")(sequelize, Sequelize);
db.orders = require("./order.js")(sequelize, Sequelize);

module.exports = db;
