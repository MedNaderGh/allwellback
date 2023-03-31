const { Firestore } = require("@google-cloud/firestore");
require("dotenv").config();
const firestore = new Firestore();
let authentication = require("./authentication");

exports.ResetMail = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "POST") {
    authentication.sendReset(req, res);
  }
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(200).send("");
  }
};
exports.login = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "POST") {
    authentication.login(req, res);
  }
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(200).send("");
  }
};
exports.signup = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "POST") {
    authentication.signup(req.body, res);
  }
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(200).send("");
  }
};
exports.changePassword = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "POST") {
    authentication.updatePassword(req, res);
  }
  if (req.method === "OPTIONS") {
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(200).send("");
  }
};
