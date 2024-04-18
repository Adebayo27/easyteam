const db = require("../models");
const User = db.users;
const Product = db.products;
const Order = db.orders;
const Op = db.Sequelize.Op;

exports.applyCommissions = async (req, res) => {
    try {
        const { productIds, commission } = req.body;
        const updatedProducts = []
        for (let i = 0; i < productIds.length; i++) {
            const id = productIds[i];
            const product = await Product.findByPk(id);
            if (!product) {
                console.warn(`Product with ID ${id} not found`);
                continue;
            }
            product.commission = commission;
            await product.save();

            // Add the updated product to the list of updated products
            updatedProducts.push(product);
        }
        return res.json({ message: 'Commission applied successfully', updatedProducts });
    } catch (error) {
        res.status(500).send({
            message: err.message || "Some error occurred",
        });
    }
}


exports.calculateCommissions = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    if (!userId || !startDate || !endDate) {
      return res
        .status(400)
        .json({
          message: "Please provide userId name, start date, and end date",
        });
    }
    const user = await User.findOne({
        where: {
            id: userId
        }
    });
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ["firstName", "lastName"],
        },
        {model: Product },
      ],
      where: {
        userId: userId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const ordersRange = await Order.findAll({
        include: [
          
        {
            model: Product,
            attributes: ["id","name", "category", "price", "commission"],
        },
        ],
        where: {
          userId: userId,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        attributes: [
            [db.sequelize.fn('date_trunc', 'day', db.sequelize.col('orders.createdAt')), 'orderDate'],
            [db.sequelize.fn('count', db.sequelize.col('*')), 'count'],
            [db.sequelize.fn('sum', db.sequelize.col('Product.commission')), 'totalCommission'], 
            'Product.id'
        ],
        group: [
            db.sequelize.fn('date_trunc', 'day', db.sequelize.col('orders.createdAt')),
            'Product.id'],
      });
      const d = []
      for (let i = 0; i < ordersRange.length; i++) {
        const e = ordersRange[i]?.get({ plain: true });
        d.push(e)
        
      }
    //   console.log(d[0]?.toISOString()?.split('T')[0])
    const groupedOrders = d.reduce((acc, order) => {
        const orderDate = order?.orderDate?.toISOString()?.split('T')[0]; // Extracting only the date without time
        if (!acc[orderDate]) {
            acc[orderDate] = [];
        }
        acc[orderDate].push(order);
        return acc;
    }, {});

    // const earningsByDate = {};
    // for (const orderDate in groupedOrders) {
    //     earningsByDate[orderDate] = groupedOrders[orderDate].map(order => ({
    //         ...order,
    //         earnings: order.Product.price * (order.Product.commission/100)
    //     }));
    // }

    const earningsByDate = {};

    // Group sales by createdAt timestamp
    orders.forEach(sale => {
        const date = sale.createdAt?.toISOString().split('T')[0]; // Extract date part from timestamp
        const earnings = sale.Product.price * (sale.Product.commission / 100); // Calculate earnings for this sale
        if (earningsByDate[date]) {
            earningsByDate[date].earnings += earnings; // Add earnings to existing total for this date
            earningsByDate[date].salesCount++;
        } else {
            earningsByDate[date] = {
                earnings: earnings,
                salesCount: 1
            };
        }
        
    });
 
    // console.log(earningsByDate);

    let totalCommission = 0;
    orders.forEach(order => {
        totalCommission += (order.Product.price * (order.Product.commission / 100));
    });

    res.send({ status: true, totalCommission, user, orders, groupedOrders, earningsByDate});
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred",
    });
  }
};
