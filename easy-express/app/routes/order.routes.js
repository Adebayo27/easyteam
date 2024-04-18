module.exports = app => {
    const product = require("../controllers/order.controller.js");
  
    var router = require("express").Router();
    router.get("/orders", product.getOrders);
    router.get("/orders-range", product.getOrdersRange);
    
    
  
    app.use('/api', router);
  };
  