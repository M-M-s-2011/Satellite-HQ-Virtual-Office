//Backend socket routes for Video Conferencing

//Define event listeners here
const joinCall = (socket, videoRoomName) => {
  socket.join(videoRoomName);
  socket.emit("joinedCall");
  console.log("joined at server");
  //notify users already in call that another user has joined
  socket.to(videoRoomName).emit("peerJoinedCall", socket.id);
};

const ready = (socket, videoRoomName) => {};

// Pass an offer along from one socket to another
const offerCreated = (socket, peerId, offer) => {
  // Route the offer to the socket with id peerId
  socket.to(peerId).emit("offerReceived", socket.id, offer);
};

// Pass an ICE candidate from one socket to another
const iceCandidateCreated = (socket, peerId, iceCandidate) => {
  socket.to(peerId).emit("iceCandidateReceived", socket.id, iceCandidate);
};

// Pass an answer from one peer to another
const answerCreated = (socket, peerId, answer) => {
  socket.to(peerId).emit("answerReceived", socket.id, answer);
};

//Leave call
const leaveCall = () => {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinCall", (videoRoomName) => joinCall(socket, videoRoomName));
    socket.on("offerCreated", (peerId, offer) =>
      offerCreated(socket, peerId, offer)
    );
    socket.on("iceCandidateCreated", (peerId, iceCandidate) =>
      iceCandidateCreated(socket, peerId, iceCandidate)
    );
    socket.on("answerCreated", (peerId, answer) =>
      answerCreated(socket, peerId, answer)
    );
  });
};
