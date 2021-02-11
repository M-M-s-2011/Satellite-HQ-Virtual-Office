const uniqid = require('uniqid');

//Backend socket routes for Video Conferencing

//Define event listeners here
const joinCall = (socket, peerId, gameRoomName, gameRooms) => {
  const gameRoomInfo = gameRooms[gameRoomName];
  const player = gameRoomInfo.players[socket.id];
  // Look up the playerInfo object for socket peerId
  const otherPlayer = gameRoomInfo.players[peerId];
  // If otherPlayer is in a video call, join it; otherwise, create a new call
  player.videoRoomName = otherPlayer.videoRoomName || uniqid('video-');
  socket.join(player.videoRoomName);
  socket.emit('joinedCall');
  //notify users already in call that another user has joined
  socket.to(player.videoRoomName).emit('peerJoinedCall', socket.id);
};

// Pass an offer along from one socket to another
const offerCreated = (socket, peerId, offer) => {
  // Route the offer to the socket with id peerId
  socket.to(peerId).emit('offerReceived', socket.id, offer);
};

// Pass an ICE candidate from one socket to another
const iceCandidateCreated = (socket, peerId, iceCandidate) => {
  socket.to(peerId).emit('iceCandidateReceived', socket.id, iceCandidate);
};

// Pass an answer from one peer to another
const answerCreated = (socket, peerId, answer) => {
  socket.to(peerId).emit('answerReceived', socket.id, answer);
};

//Leave call
const leaveCall = (socket, gameRoomName, gameRooms) => {
  const player = gameRooms[gameRoomName].players[socket];
  if (player) {
    const videoRoomName = player.videoRoomName;
    player.videoRoomName = null;
    socket.leave(videoRoomName);
    socket.to(videoRoomName).emit('peerLeftCall', socket.id);
  }
};

module.exports = (io, gameRooms) => {
  io.on('connection', (socket) => {
    socket.on('joinCall', (peerId, gameRoomName) =>
      joinCall(socket, peerId, gameRoomName, gameRooms)
    );
    socket.on('offerCreated', (peerId, offer) =>
      offerCreated(socket, peerId, offer)
    );
    socket.on('iceCandidateCreated', (peerId, iceCandidate) =>
      iceCandidateCreated(socket, peerId, iceCandidate)
    );
    socket.on('answerCreated', (peerId, answer) =>
      answerCreated(socket, peerId, answer)
    );
    socket.on('leaveCall', (gameRoomName) =>
      leaveCall(socket, gameRoomName, gameRooms)
    );
  });
};
