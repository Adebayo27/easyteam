const db = require("../models");
const uuid = require("uuid");
const User = db.users;
const ApiKey = db.apiKeys;
const ApiKeyUsage = db.apiKeyUsage;
const Tracking = db.tracking;
const Organization = db.organizations;

exports.getStaffs = async (req, res) => {
  try {
    const users = await User.findAll();
    res.send({ users });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users.",
    });
  }
};
