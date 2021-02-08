import connectChat from "./chat";
import connectGame from "./game";
import connectVideo from "./video";

const connect = (scene) => {
  connectChat(scene);
  connectGame(scene);
  connectVideo(scene);
};

export default connect;
