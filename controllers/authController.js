require("dotenv").config();

const database = require("./../database");

const Users = database.Users;

const jwt = require("jsonwebtoken");

exports.signIn = (req, res) => {
  if (Users.length === 0) {
    res.status(500).send({ message: "Serverio klaida!" });
    return;
  }

  let user = Users.find((item) => item.name == req.body.username);

  if (!user) {
    res.status(500).send({
      message: "Klaidingai įvestas vartotojo vardas arba slaptažodis!",
    }); //User not found
    return;
  }
  const passwordIsValid = req.body.password === user.password;
  if (!passwordIsValid) {
    return res.status(403).send({
      accessToken: null,
      message: "Klaidingai įvestas vartotojo vardas arba slaptažodis!", // Invalid Password
    });
  }

  const JWT_SECRET = "labas";
  const JWT_EXPIRES_IN = 10000;

  const token = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  res.status(200).send({
    id: user._id,
    name: user.name,
    accessToken: token,
    refreshToken: "LAIKINAS",
  });
};
