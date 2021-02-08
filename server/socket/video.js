//Backend socket routes for Video Conferencing
//Connects backend event listeners to sockets

//Define event listeners here

//Define event listeners here
const joinCall = (socket, videoRoomName) => {
  socket.to(videoRoomName).emit("joinedCall");
};

//Get room name
const getVideoChannel = () => {};

//Leave call
const leaveCall = () => {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinCall", (videoRoomName) => joinRoom(socket, videoRoomName));
  });
};
