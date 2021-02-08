import Phaser from "phaser";

export default class ChatScene extends Phaser.Scene {
  constructor() {
    super("ChatScene");
  }
  init(data) {
    this.roomKey = data.roomKey;
    this.players = data.players;
    this.numPlayers = data.numPlayers;
    this.socket = data.socket;
  }
  preload() {
    this.load.image("chatMachine", "assets/sprites/chatMachine.png");
    this.load.html("codeform", "assets/text/chatForm.html");
  }
  create() {
    const scene = this;
  }
}
