//front end event listeners for game
const joinRoom = (socket, gameRooms, roomKey) => {
	socket.join(roomKey);
	const roomInfo = gameRooms[roomKey];
	console.log('roomInfo', roomInfo);
	roomInfo.players[socket.id] = {
		rotation: 0,
		x: 400,
		y: 300,
		playerId: socket.id,
	};
	//update number of players
	roomInfo.numPlayers = Object.keys(roomInfo.players).length;

	//send the players object to the new player
	socket.emit('currentPlayers', {
		players: roomInfo.players,
		numPlayers: roomInfo.numPlayers,
	});

	// update all other players of the new player
	//  socket.to(roomKey).emit("newPlayer", {
	//   playerInfo: roomInfo.players[socket.id],
	//   numPlayers: roomInfo.numPlayers,
	// });
};

//connect event listeners
const connectGame = (io, gameRooms) => {
	io.on('connection', (socket) => {
		socket.on('joinRoom', (roomKey) => joinRoom(socket, gameRooms, roomKey));
	});
};

export default connectGame;
