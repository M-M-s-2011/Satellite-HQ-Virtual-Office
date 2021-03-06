//just for socket-related stuff
//could take scene as parameter
//listeners on this front end

const messageDisplay = document.getElementById("message-display");
const NUM_MESSAGES = 10;

// EVENT LISTENER FOR SET STATE
const setState = (scene, state) => {
  const { gameRoomName, players, numPlayers } = state;
  scene.physics.resume();

  // STATE
  scene.state.gameRoomName = gameRoomName;
  scene.state.players = players;
  scene.state.numPlayers = numPlayers;
};

//current players
const currentPlayers = (scene, arg) => {
  const { players, numPlayers } = arg;
  scene.state.numPlayers = numPlayers;
  Object.keys(players).forEach(function (id) {
    if (players[id].playerId === scene.socket.id) {
      scene.addPlayer(scene, players[id]);
    } else {
      scene.addOtherPlayers(scene, players[id]);
    }
  });
};

//new player
const newPlayer = (scene, arg) => {
  const { playerInfo, numPlayers } = arg;
  scene.addOtherPlayers(scene, playerInfo);
  scene.state.numPlayers = numPlayers;
};

//playerMoved
const playerMoved = (scene, playerInfo) => {
  scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
    if (playerInfo.playerId === otherPlayer.playerId) {
      const oldX = otherPlayer.x;
      const oldY = otherPlayer.y;
      otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      otherPlayer.playerName.x = playerInfo.x;
      otherPlayer.playerName.y = playerInfo.y;
    }
  });
};

const playerSetName = (scene, playerInfo) => {
  scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
    if (playerInfo.playerId === otherPlayer.playerId) {
      otherPlayer.playerName.setText(playerInfo.playerName);
    }
  });
};

//broadcast messages
const broadcastMessage = (username, message) => {
  //check the size of children for messagedisplay
  if (messageDisplay.childNodes.length === NUM_MESSAGES) {
    //cap the num of messages at NUM_MESSAGES
    messageDisplay.removeChild(messageDisplay.firstChild);
  }
  const newMessage = document.createElement("p");
  newMessage.innerHTML = `<p><strong>${username}:</strong> &nbsp${message}</p>`;
  messageDisplay.appendChild(newMessage);
};

//disconnected
const disconnected = (scene, arg) => {
  const { playerId, numPlayers } = arg;
  scene.state.numPlayers = numPlayers;
  scene.otherPlayers.getChildren().forEach((otherPlayer) => {
    if (playerId === otherPlayer.playerId) {
      otherPlayer.playerName.destroy();
      otherPlayer.destroy();
      // If the player that disconnected was a neighbor of our sprite,
      // delete it from the nearbyPlayers object
      delete scene.nearbyPlayers[playerId];
    }
  });
};

const connectGame = (scene) => {
  //when a socket emits "setState", it sets the state in the payload of the socket emission
  scene.socket.on("setState", (state) => setState(scene, state));
  scene.socket.on("currentPlayers", (arg) => currentPlayers(scene, arg));
  scene.socket.on("newPlayer", (arg) => newPlayer(scene, arg));
  scene.socket.on("playerMoved", (playerInfo) =>
    playerMoved(scene, playerInfo)
  );
  scene.socket.on("playerSetName", (playerInfo) =>
    playerSetName(scene, playerInfo)
  );
  scene.socket.on("broadcastMessage", (username, message) =>
    broadcastMessage(username, message)
  );
  scene.socket.on("disconnected", (arg) => disconnected(scene, arg));
};

export default connectGame;
