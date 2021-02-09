import { ICE_SERVERS, PEER_VIDEOS, VIDEO_SETTINGS } from "./RTC/constants";

//front end event listeners for video
const joinedCall = async (scene) => {
  try {
    const userStream = await navigator.mediaDevices.getUserMedia(
      VIDEO_SETTINGS
    );
    scene.userStream = userStream;
    const video = document.getElementById("myvideo");
    video.srcObject = userStream;
    video.onloadedmetadata = () => {
      video.play();
    };
  } catch (error) {
    console.log(error);
  }
};

const peerJoinedCall = (scene, peerId) => {
  console.log("peer joined call @client/video", scene.socket.id, peerId);
};

const connectVideo = (scene) => {
  scene.socket.on("joinedCall", () => joinedCall(scene));
  scene.socket.on("peerJoinedCall", (peerId) => peerJoinedCall(scene, peerId));
};

export default connectVideo;
