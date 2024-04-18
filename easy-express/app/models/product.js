'use strict';
const {
  Model
} = require('sequelize');
// module.exports = (sequelize, Sequelize) => {
//   const Product = sequelize.define("Product", {
//     id: {
//       type: Sequelize.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     name: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     category: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//     price: {
//       type: Sequelize.DOUBLE,
//       allowNull: false,
//     },
//     commission: {
//       type: Sequelize.DOUBLE,
//       allowNull: false,
//     },
//   });

//   // sequelize.sync({ alter: true })
//   // sequelize.sync()

//   // User.prototype.toJSON = function () {
//   //   const values = Object.assign({}, this.get());
  
//   //   delete values.password;
//   //   return values;
//   // };

//   return Product;
// };
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init({
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    commission: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Product',
    paranoid: true
  });
  return Product;
};