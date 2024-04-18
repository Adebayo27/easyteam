const db = require("../models");
const User = db.users;
const Product = db.products;
const Order = db.orders;
// const faker = require('@faker-js/faker');
const { faker } = require("@faker-js/faker");
const generateRandomProduct = () => ({
  name: faker.commerce.product(),
  category: faker.commerce.department(),
  price: faker.commerce.price(),
  commission: 0,
});

const generateRandomUser = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email(),
});

const generateRandomOrder = () => ({
    userId: faker.number.int({ min: 21, max: 40 }),
    productId: faker.number.int({ min: 1, max: 20 }),
    quantity: faker.number.int({ min: 1, max: 20 }),
});

exports.getAllProducts = async (req, res) => {
  try {
    const product = await Product.findAll({
        order: [
            ['id', 'ASC'],
        ],
    });
    res.send({ status: true, product });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving products.",
    });
  }
};

exports.createProduct = async (req, res) => {
    try {
      const { name, category, price, commission } = req.body;
      const product = await Product.create({
        name, category, price, commission
      });
      res.send({ status: true, product });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving products.",
      });
    }
  };

  exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
      const { name, category, price, commission } = req.body;
      const product = await Product.findByPk(productId);
      if(product){
        product.name = name
        product.category = category
        product.price = Number(price)
        product.commission = Number(commission)
        await product.save()
        res.send({ status: true, product });
      }else{
        return res.status(404).json({ message: 'Product not found' });
      }
      
    } catch (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving products.",
      });
    }
  };

exports.seedProductWithFakeData = async (req, res) => {
  try {
    // // seed 20 staffs
    // const user = await Promise.all(
    //   Array.from({ length: 20 }, () => User.create(generateRandomUser()))
    // );
    // //seed 100 products
    // const product = await Promise.all(
    //   Array.from({ length: 100 }, () => Product.create(generateRandomProduct()))
    // );

    const order = await Promise.all(
        Array.from({ length: 100 }, () => Order.create(generateRandomOrder()))
    );

    res.send({ status: true, order });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while seeding products.",
    });
  }
};
