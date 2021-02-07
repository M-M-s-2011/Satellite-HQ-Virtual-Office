import connectChat from './chat'
import connectGame from "./game";
import connectVideoRoutes from "./video";

const connect = (scene) => {
  connectChat(scene)
  connectGame(scene);
};

export default connect;
