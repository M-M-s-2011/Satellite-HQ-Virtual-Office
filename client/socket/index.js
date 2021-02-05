//connect front end event listeners to Socket
import connectVideo from './video';
import connectGame from './Game';

const gameRooms = {
	office: {
		// users: [],
		players: {},
		numPlayers: 0,
	},
};

const connect = (io) => {
	connectVideo(io);
	connectGame(io, gameRooms);
};

export default connect;
