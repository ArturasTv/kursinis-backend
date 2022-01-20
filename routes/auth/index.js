const express = require("express");

const controller = require("../../controllers/authController");

const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.post("/auth/signin", controller.signIn);

module.exports = router;
