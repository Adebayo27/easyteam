const db = require("../models");
const User = db.users;
const Product = db.products;
const Order = db.orders;
const Op = db.Sequelize.Op;

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
        include: [
            {
                model: User,
          attributes: [ 'firstName', 'lastName']
            }
        ]
    })
    res.send({ status: true, orders:orders });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while fetching orders.",
    });
  }
};

exports.getOrdersRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
      const orders = await Order.findAll({
          include: [
            {
                model: User,
                attributes: [ 'firstName', 'lastName']
            },
            {
                model: Product,
                attributes: [ 'name', 'commission']
            },
          ],
          where: {
            createdAt: {
            [Op.between]: [startDate, endDate],
        },
      }
      })
      res.send({ status: true, orders:orders });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while fetching orders.",
      });
    }
  };
