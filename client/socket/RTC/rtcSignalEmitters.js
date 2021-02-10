import { ICE_SERVERS, PEER_VIDEOS, VIDEO_SETTINGS } from './constants';

//things that have to do with the functions that you put inside createOffer() & createAnswer(), and things you add to RTCPeerConnections
// Waits for an ICE candidate to be created, then signals server
export const emitIceCandidateCreated = (scene, peerId, event) => {
  if (event.candidate) {
    scene.socket.emit('iceCandidateCreated', peerId, event.candidate);
  }
};

// Event listener for media stream from a remote peer
// Creates a video tage with id `video_${peerId}`, loads the media stream, and plays
export const loadPeerVideo = (peerVideo, event) => {
  console.log('event', event);
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = () => peerVideo.play();
};

// Create an RTCPeerConnection for communicating
// with the peer at socket peerId
export const createRTCPeerConnection = (scene, peerId) => {
  const rtcPeerConnection = new RTCPeerConnection(ICE_SERVERS);
  // Store RTCPeerConnection so we can clean up later
  scene.rtcPeerConnections[peerId] = rtcPeerConnection;
  // Add user's audio and video tracks
  rtcPeerConnection.addTrack(scene.userStream.getTracks()[0], scene.userStream);
  rtcPeerConnection.addTrack(scene.userStream.getTracks()[1], scene.userStream);
  // Add ice candidate emitter
  rtcPeerConnection.onicecandidate = (event) =>
    emitIceCandidateCreated(scene, peerId, event);

  // Create video tag for peer video
  // to be loaded later
  const peerVideo = document.createElement('video');
  peerVideo.id = `video_${peerId}`;
  PEER_VIDEOS.appendChild(peerVideo);

  // Add listener to load and play peer video
  rtcPeerConnection.ontrack = (event) => loadPeerVideo(peerVideo, event);
  return rtcPeerConnection;
};
