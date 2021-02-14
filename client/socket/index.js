import connectGame from './game';
import connectVideo from './video';

const connect = (scene) => {
  connectGame(scene);
  connectVideo(scene);
};

export default connect;
