const database = require("./../database");

const Users = database.Users;

exports.getStats = (req, res) => {
  if (!Users) {
    res.status(500).send({ message: "Serverio klaida!" });
    return;
  }

  let filteredUsers = Users.map((user) => {
    return {
      name: user.name,
      wins: user.wins,
      loses: user.loses,
      draws: user.draws,
      rating: user.rating,
    };
  });

  res.status(200).send(filteredUsers);
};
