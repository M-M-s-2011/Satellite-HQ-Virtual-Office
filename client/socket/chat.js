//front end event listeners for text chat

// add user joined chat listener
// Prints 'username has joined the chat'

// add user left chat listener
// Prints 'username has left the chat'

// When we receive a chat message, append it to chatWindow
// message = {username, body}
const broadcastMessage = (message, chatWindow) => {
  chatWindow.innnerHTML += `<p><strong>${message.username}:</strong> ${message.body}</p>`;
};

// register the front end event listeners for text chat
const connectChat = (scene) => {
  scene.socket.on('broadcastMessage', (message) =>
    broadcastMessage(message, scene.chatWindow)
  );
};

export default connectChat;
