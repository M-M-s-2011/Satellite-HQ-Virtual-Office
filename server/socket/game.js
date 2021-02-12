//Backend socket routes for game
//Connects backend event listeners to sockets
//emits from backend

//back end event listeners for game
const joinRoom = (socket, gameRooms, gameRoomName) => {
  socket.join(gameRoomName);
  const gameRoomInfo = gameRooms[gameRoomName];
  gameRoomInfo.players[socket.id] = {
    rotation: 0,
    x: 400,
    y: 300,
    playerId: socket.id,
    playerName: "",
    videoRoomName: null,
  };
  //update number of players
  gameRoomInfo.numPlayers = Object.keys(gameRoomInfo.players).length;

  // set initial state
  socket.emit("setState", gameRoomInfo);

  //send the players object to the new player
  socket.emit("currentPlayers", {
    players: gameRoomInfo.players,
    numPlayers: gameRoomInfo.numPlayers,
  });

  // update all other players of the new player
  socket.to(gameRoomName).emit("newPlayer", {
    playerInfo: gameRoomInfo.players[socket.id],
    numPlayers: gameRoomInfo.numPlayers,
  });
};

//when a player moves, update the player data
const playerMoved = (socket, gameRooms, data) => {
  const { x, y, gameRoomName } = data;
  gameRooms[gameRoomName].players[socket.id].x = x;
  gameRooms[gameRoomName].players[socket.id].y = y;
  // emit a message to all players about the player that moved
  socket
    .to(gameRoomName)
    .emit("playerMoved", gameRooms[gameRoomName].players[socket.id]);
};

// when a player disconnects, remove them from our players object
const disconnect = (socket, gameRooms, io) => {
  //find which room they belong to
  let gameRoomName = "";
  for (let keys1 in gameRooms) {
    for (let keys2 in gameRooms[keys1]) {
      Object.keys(gameRooms[keys1][keys2]).map((el) => {
        if (el === socket.id) {
          gameRoomName = keys1;
        }
      });
    }
  }

  const gameRoomInfo = gameRooms[gameRoomName];

  if (gameRoomInfo) {
    const player = gameRoomInfo.players[socket.id];

    if (player.videoRoomName) {
      const videoRoomName = player.videoRoomName;
      socket.leave(videoRoomName);
      socket.to(videoRoomName).emit("peerLeftCall", socket.id);
    }
    // remove this player from our players object
    delete gameRoomInfo.players[socket.id];
    // update numPlayers
    gameRoomInfo.numPlayers = Object.keys(gameRoomInfo.players).length;
    // emit a message to all players to remove this player
    io.to(gameRoomName).emit("disconnected", {
      playerId: socket.id,
      numPlayers: gameRoomInfo.numPlayers,
    });
  }
};

//connect event listeners
const connectGame = (io, gameRooms) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (gameRoomName) =>
      joinRoom(socket, gameRooms, gameRoomName)
    );

    // when a player moves, update the player data, & notify all players
    socket.on("playerMovement", (data) => playerMoved(socket, gameRooms, data));

    // when a player disconnects, remove the player data from the room and notify all players
    socket.on("disconnect", () => disconnect(socket, gameRooms, io));
  });
};

module.exports = connectGame;
