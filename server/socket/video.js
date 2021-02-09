//Backend socket routes for Video Conferencing
//Connects backend event listeners to sockets

//Define event listeners here

//Define event listeners here
const joinCall = (socket, videoRoomName) => {
  socket.join(videoRoomName);
  socket.emit('joinedCall');
  console.log('joined at server');
  // Notify users already in the call that a new peer has joined
  socket.to(videoRoomName).emit('peerJoined', { peerId: socket.id });
};

// Pass an offer along from one socket to another
const offerCreated = (socket, data) => {
  const { peerId, offer } = data;
  // Route the offer to the socket with id peerId
  socket.to(peerId).emit('offerReceived', { peerId: socket.id, offer });
};

// Pass an ICE candidate from one socket to another
const iceCandidateCreated = (socket, data) => {
  const { peerId, iceCandidate } = data;
  socket
    .to(peerId)
    .emit('iceCandidateReceived', { peerId: socket.id, iceCandidate });
};

// Pass an answer from one peer to another
const answerCreated = (socket, data) => {
  const { peerId, answer } = data;
  socket.to(peerId).emit('answerReceived', { peerId: socket.id, answer });
};

//Get room name
const getVideoChannel = () => {};

//Leave call
const leaveCall = () => {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('joinCall', (videoRoomName) => joinCall(socket, videoRoomName));
    socket.on('offerCreated', (data) => offerCreated(socket, data));
    socket.on('iceCandidateCreated', (data) =>
      iceCandidateCreated(socket, data)
    );
    socket.on('answerCreated', (data) => answerCreated(socket, data));
  });
};
