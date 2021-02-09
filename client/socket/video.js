//front end event listeners for video
const joinedCall = async (scene) => {
  try {
    console.log("I joined at client!!");
    const userStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 200, height: 200 },
    });
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
