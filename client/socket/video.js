import { VIDEO_SETTINGS } from "./RTC/constants";
import { createRTCPeerConnection } from "./RTC/rtcSignalEmitters";

// Helper function for loading user video
const loadUserStream = async (scene) => {
  if (!scene.userStream) {
    scene.userStream = await navigator.mediaDevices.getUserMedia(
      VIDEO_SETTINGS
    );
  }
};

//front end event listeners for video
const joinedCall = async (scene) => {
  try {
    await loadUserStream(scene);
    const video = document.getElementById("myvideo");
    video.srcObject = scene.userStream;
    video.onloadedmetadata = () => {
      video.play();
    };
  } catch (error) {
    console.log(error);
  }
};

const peerJoinedCall = async (scene, peerId) => {
  console.log("peer joined call @client/video", scene.socket.id, peerId);
  await loadUserStream(scene);
  // Create and store RTCPeerConnection
  const rtcPeerConnection = createRTCPeerConnection(scene, peerId);
  // Create the offer and emit it to the server
  const offer = await rtcPeerConnection.createOffer();
  rtcPeerConnection.setLocalDescription(offer);
  console.log("Offer created");
  scene.socket.emit("offerCreated", peerId, offer);
};

// Listener for an offer from a peer
const offerReceived = async (scene, peerId, offer) => {
  await loadUserStream(scene);
  // Create and store RTCPeerConnection here
  const rtcPeerConnection = createRTCPeerConnection(scene, peerId);
  // Set the remote description
  rtcPeerConnection.setRemoteDescription(offer);
  // Create an answer and set it as the local description
  const answer = await rtcPeerConnection.createAnswer();
  rtcPeerConnection.setLocalDescription(answer);
  scene.socket.emit("answerCreated", peerId, answer);
};

// Listener for an ICE Candidate from a remote peer
const iceCandidateReceived = (scene, peerId, iceCandidate) => {
  // a peer at socket peerId has sent us an ICE candidate
  // add it to the corresponding RTCPeerConnection object
  if (scene.rtcPeerConnections[peerId]) {
    scene.rtcPeerConnections[peerId].addIceCandidate(
      new RTCIceCandidate(iceCandidate)
    );
  }
};

// Listener for an answer from a remote peer
const answerReceived = (scene, peerId, answer) => {
  // Received an answer from a peer at socket peerId
  // Find the corresponding RTCPeerConnection object and update its remote description
  console.log("answer received");
  scene.rtcPeerConnections[peerId].setRemoteDescription(answer);
  console.log(document.getElementsByTagName("video"));
};

const connectVideo = (scene) => {
  scene.socket.on("joinedCall", () => joinedCall(scene));
  scene.socket.on("peerJoinedCall", (peerId) => peerJoinedCall(scene, peerId));
  scene.socket.on("offerReceived", (peerId, offer) =>
    offerReceived(scene, peerId, offer)
  );
  scene.socket.on("iceCandidateReceived", (peerId, iceCandidate) =>
    iceCandidateReceived(scene, peerId, iceCandidate)
  );
  scene.socket.on("answerReceived", (peerId, answer) =>
    answerReceived(scene, peerId, answer)
  );
};

export default connectVideo;
