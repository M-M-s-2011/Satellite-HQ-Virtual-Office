//Place to call all the socket functions
const connectVideoRoutes = require('./video');
const connectGameRoutes = require('./game');

const gameRooms = {
  office: {
    gameRoomName: 'office',
    players: {},
    numPlayers: 0,
    avatars: {
      carly: 'assets/spritesheets/carly.png',
      gracie: 'assets/spritesheets/gracie.png',
      lb: 'assets/spritesheets/lb.png',
      navya: 'assets/spritesheets/navya.png',
      star: 'assets/spritesheets/carly.png',
    },
  },
};

const connect = (io) => {
  connectVideoRoutes(io, gameRooms);
  connectGameRoutes(io, gameRooms);
};

module.exports = connect;
