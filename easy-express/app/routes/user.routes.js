module.exports = app => {
    const user = require("../controllers/user.controller.js");
  
    var router = require("express").Router();
    router.get("/staffs", user.getStaffs);
    app.use('/api', router);
  };
  