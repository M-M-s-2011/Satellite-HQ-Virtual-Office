//just for socket-related stuff
//could take scene as parameter
//listeners on this front end

// EVENT LISTENER FOR SET STATE
const setState = (scene, state) => {
  const { roomKey, players, numPlayers } = state;
  scene.physics.resume();

  // STATE
  scene.state.roomKey = roomKey;
  scene.state.players = players;
  scene.state.numPlayers = numPlayers;
};

const connectGame = (scene) => {
  //when a socket emits "setState", it sets the state in the payload of the socket emission
  scene.socket.on("setState", (state) => setState(scene, state));
};

export default connectGame;
