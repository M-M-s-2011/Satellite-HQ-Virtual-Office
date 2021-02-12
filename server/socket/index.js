//Place to call all the socket functions
const connectVideoRoutes = require("./video");
const connectGameRoutes = require("./game");

const gameRooms = {
  office: {
    gameRoomName: "office",
    players: {},
    numPlayers: 0,
  },
};

const connect = (io) => {
  connectVideoRoutes(io, gameRooms);
  connectGameRoutes(io, gameRooms);
};

module.exports = connect;
