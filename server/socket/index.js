//Place to call all the socket functions
const connectVideoRoutes = require("./video");
const connectGameRoutes = require("./game");
module.exports = (io) => {
  connectGameRoutes(io);
  connectVideoRoutes(io);
};
