module.exports = app => {
    const commission = require("../controllers/commission.controller.js");
  
    var router = require("express").Router();
    router.post("/commission/apply", commission.applyCommissions);
    router.post("/commission/calculate", commission.calculateCommissions);
    
    
  
    app.use('/api', router);
  };
  