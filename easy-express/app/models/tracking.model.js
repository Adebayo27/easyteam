const Sequelize = require("sequelize");
const sequelize = require("../config/app-config.js");
const User = require("./user.model.js")(sequelize, Sequelize);


module.exports = (sequelize, Sequelize) => {
    const Tracking = sequelize.define("trackings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      // Model attributes are defined here
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      apiKey: {
        type: Sequelize.STRING,
        allowNull: false, 
      },
      containerNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      response: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      trackingId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shipmentId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      // fullName: {
      //   type: Sequelize.VIRTUAL, // Virtual means it's not stored in the database
      //   async get() {
      //     const user = await User.findOne({
      //       where: {
      //         id: this.userId,
      //       }
      //     })
      //     return `${user.firstName}-${user.lastName}`;
      //   }
      // }
      // deleted: {
      //   type: Sequelize.BOOLEAN,
      //   allowNull: false,
      //   defaultValue: false // Default to false, meaning not deleted
      // }
    }, {
      paranoid: true
    });
    
    Tracking.belongsTo(User);
    // sequelize.sync({ alter: true })
    sequelize.sync()
    return Tracking;
  };
  