export const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const PEER_VIDEOS = document.getElementById('peerRoom');

export const VIDEO_SETTINGS = {
  audio: true,
  video: {
    width: 200,
    height: 200,
  },
};
