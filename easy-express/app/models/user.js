const Sequelize = require("sequelize");
const sequelize = require("../config/app-config.js");
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  // sequelize.sync({ alter: true })
  // sequelize.sync()

  // User.prototype.toJSON = function () {
  //   const values = Object.assign({}, this.get());
  
  //   delete values.password;
  //   return values;
  // };

  return User;
};
