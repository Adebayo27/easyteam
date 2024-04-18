const Sequelize = require("sequelize");
const sequelize = require("../config/app-config.js");
const User = require("./user")(sequelize, Sequelize);
const Product = require("./product")(sequelize, Sequelize);

module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("orders", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Model attributes are defined here
    productId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  Order.belongsTo(User);
  Order.belongsTo(Product, { foreignKey: 'productId' });
  // sequelize.sync({ alter: true })
  // sequelize.sync()

  // User.prototype.toJSON = function () {
  //   const values = Object.assign({}, this.get());
  
  //   delete values.password;
  //   return values;
  // };

  return Order;
};
