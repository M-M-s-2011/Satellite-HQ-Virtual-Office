const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
const PEER_VIDEOS = document.getElementById('peervideos');

//front end event listeners for video
const joinedCall = async (scene) => {
  try {
    console.log('I joined at client!!');
    const userStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 200, height: 200 },
    });
    scene.userStream = userStream;
    const video = document.getElementById('myvideo');
    video.srcObject = userStream;
    video.onloadedmetadata = () => {
      video.play();
    };
  } catch (error) {
    console.log(error);
  }
};

// Waits for an ICE candidate to be created, then signals server
const emitIceCandidateCreated = (scene, peerId, event) => {
  if (event.candidate) {
    scene.socket.emit('iceCandidateCreated', {
      peerId,
      iceCandidate: event.candidate,
    });
  }
};

// Event listener for media stream from a remote peer
// Creates a video tage with id `video_${peerId}`, loads the media stream, and plays
const loadPeerVideo = (peerId, event) => {
  console.log('creating peer video');
  const peerVideo = document.createElement('video');
  peerVideo.id = `video_${peerId}`;
  PEER_VIDEOS.appendChild(peerVideo);
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata(() => peerVideo.play());
};

// Create an RTCPeerConnection for communicating
// with the peer at socket peerId
const createRTCPeerConnection = (scene, peerId) => {
  const rtcPeerConnection = new RTCPeerConnection(ICE_SERVERS);
  // Store RTCPeerConnection so we can clean up later
  scene.rtcPeerConnections[peerId] = rtcPeerConnection;
  // Add user's audio and video tracks
  rtcPeerConnection.addTrack(scene.userStream.getTracks()[0], scene.userStream);
  rtcPeerConnection.addTrack(scene.userStream.getTracks()[1], scene.userStream);
  // Add ice candidate emitter
  rtcPeerConnection.onicecandidate = (event) =>
    emitIceCandidateCreated(scene, peerId, event);
  // Add listener to load and play peer video
  rtcPeerConnection.ontrack = (event) => loadPeerVideo(peerId, event);
  return rtcPeerConnection;
};

// Listener for when a new peer joins the call
const peerJoined = (scene, data) => {
  const { peerId } = data;
  console.log(`Client side: new user ${peerId} has joined the call`);
  // Create and store RTCPeerConnection
  const rtcPeerConnection = createRTCPeerConnection(scene, peerId);
  // Create the offer
  rtcPeerConnection.createOffer((offer) =>
    emitOfferCreated(scene, rtcPeerConnection, offer)
  );
};

// Create and emit offer for an RTCPeerConnection
const emitOfferCreated = (scene, rtcPeerConnection, offer) => {
  try {
    rtcPeerConnection.setLocalDescription(offer);
    scene.socket.emit('offerCreated', { peerId: scene.socket.id, offer });
  } catch (error) {
    console.log(error);
  }
};

// Create and emit an answer for an RTCPeerConnection
const emitAnswerCreated = (scene, rtcPeerConnection, answer) => {
  try {
    rtcPeerConnection.setLocalDescription(answer);
    scene.socket.emit('answerCreated', { peerId: scene.socket.id, answer });
  } catch (error) {
    console.log(error);
  }
};

// Listener for an offer from a peer
const offerReceived = (scene, data) => {
  const { peerId, offer } = data;
  // Create and store RTCPeerConnection here
  const rtcPeerConnection = createRTCPeerConnection(scene, peerId);
  // Set the remote description
  rtcPeerConnection.setRemoteDescription(offer);
  // Create an answer and set it as the local description
  rtcPeerConnection.createAnswer((answer) =>
    emitAnswerCreated(scene, rtcPeerConnection, answer)
  );
};

// Listener for an ICE Candidate from a remote peer
const iceCandidateReceived = (scene, data) => {
  const { peerId, iceCandidate } = data;
  // a peer at socket peerId has sent us an ICE candidate
  // add it to the corresponding RTCPeerConnection object
  scene.rtcPeerConnections[peerId].addIceCandidate(
    new RTCIceCandidate(iceCandidate)
  );
};

// Listener for an answer from a remote peer
const answerReceived = (scene, data) => {
  const { peerId, answer } = data;
  // Received an answer from a peer at socket peerId
  // Find the corresponding RTCPeerConnection object and update its remote description
  scene.rtcPeerConnections[peerId].setRemoteDescription(answer);
};

const connectVideo = (scene) => {
  scene.socket.on('joinedCall', () => joinedCall(scene));
  scene.socket.on('peerJoined', (data) => peerJoined(scene, data));
  scene.socket.on('offerReceived', (data) => offerReceived(scene, data));
  scene.socket.on('iceCandidateReceived', (data) =>
    iceCandidateReceived(scene, data)
  );
  scene.socket.on('answerReceived', (data) => answerReceived(scene, data));
};

export default connectVideo;
