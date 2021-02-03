//connect front end event listeners to Socket
import connectVideo from "./video";
import connectGame from "./Game";

const connect = (io) => {
  connectVideo(io);
  connectGame(io);
};

export default connect;
