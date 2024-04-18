module.exports = app => {
    const product = require("../controllers/product.controller.js");
  
    var router = require("express").Router();
    router.get("/products", product.getAllProducts);
    router.post("/product/:productId", product.updateProduct);
    
    router.get("/seed-products", product.seedProductWithFakeData);
    
    
  
    app.use('/api', router);
  };
  