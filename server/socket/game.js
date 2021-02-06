//Backend socket routes for game
//Connects backend event listeners to sockets
//emits from backend

//back end event listeners for game
const joinRoom = (socket, gameRooms, roomKey) => {
  socket.join(roomKey);
  const roomInfo = gameRooms[roomKey];
  roomInfo.players[socket.id] = {
    rotation: 0,
    x: 400,
    y: 300,
    playerId: socket.id,
  };
  //update number of players
  roomInfo.numPlayers = Object.keys(roomInfo.players).length;

  // set initial state
  socket.emit('setState', roomInfo);

  //send the players object to the new player
  socket.emit('currentPlayers', {
    players: roomInfo.players,
    numPlayers: roomInfo.numPlayers,
  });

  // update all other players of the new player
  socket.to(roomKey).emit('newPlayer', {
    playerInfo: roomInfo.players[socket.id],
    numPlayers: roomInfo.numPlayers,
  });
};

//when a player moves, update the player data
const playerMoved = (socket, gameRooms, data) => {
  const { x, y, roomKey } = data;
  gameRooms[roomKey].players[socket.id].x = x;
  gameRooms[roomKey].players[socket.id].y = y;
  // emit a message to all players about the player that moved
  socket.to(roomKey).emit('playerMoved', gameRooms[roomKey].players[socket.id]);
};

// when a player disconnects, remove them from our players object
const disconnect = (socket, gameRooms, io) => {
  //find which room they belong to
  let roomKey = '';
  for (let keys1 in gameRooms) {
    for (let keys2 in gameRooms[keys1]) {
      Object.keys(gameRooms[keys1][keys2]).map((el) => {
        if (el === socket.id) {
          roomKey = keys1;
        }
      });
    }
  }

  const roomInfo = gameRooms[roomKey];

  if (roomInfo) {
    console.log('user disconnected: ', socket.id);
    // remove this player from our players object
    delete roomInfo.players[socket.id];
    // update numPlayers
    roomInfo.numPlayers = Object.keys(roomInfo.players).length;
    // emit a message to all players to remove this player
    io.to(roomKey).emit('disconnected', {
      playerId: socket.id,
      numPlayers: roomInfo.numPlayers,
    });
  }
};

//connect event listeners
const connectGame = (io, gameRooms) => {
  io.on('connection', (socket) => {
    socket.on('joinRoom', (roomKey) => joinRoom(socket, gameRooms, roomKey));

    // when a player moves, update the player data, & notify all players
    socket.on('playerMovement', (data) => playerMoved(socket, gameRooms, data));
    // when a player disconnects, remove the player data from the room and notify all players
    socket.on('disconnect', () => disconnect(socket, gameRooms, io));
  });
};

module.exports = connectGame;
