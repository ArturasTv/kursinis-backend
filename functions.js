const pieceType = {
  QUEEN: "QUEEN",
  PAWN: "PAWN",
};

const pieceColor = {
  BLACK: "BLACK",
  WHITE: "WHITE",
};

const playerType = {
  BLACK: "BLACK",
  WHITE: "WHITE",
};

const initialPieces = () => {
  let pieces = [];

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      pieces.push({
        pieceType: pieceType.PAWN,
        pieceColor: pieceColor.BLACK,
        playerType: playerType.BLACK,
        x: 7 - i * 2 - (j % 2),
        y: 7 - j,
      });
    }
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      pieces.push({
        pieceType: pieceType.PAWN,
        pieceColor: pieceColor.WHITE,
        playerType: playerType.WHITE,
        x: i * 2 + (j % 2),
        y: j,
      });
    }
  }

  return pieces;
};

const rotatePieces = (pieces) => {
  let n = pieces.length;
  let deepCopy = JSON.parse(JSON.stringify(pieces));
  for (let i = 0; i < n; i++) {
    deepCopy[i].x = 7 - deepCopy[i].x;
    deepCopy[i].y = 7 - deepCopy[i].y;
  }
  return deepCopy;
};

module.exports = {
  initialPieces,
  rotatePieces,
};
