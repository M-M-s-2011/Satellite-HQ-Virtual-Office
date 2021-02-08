/** @type {import("../typings/phaser")} */

import "phaser";
import config from "./config/config";
import MainScene from "./scenes/MainScene";
import ChatScene from "./scenes/ChatScene";

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("MainScene", MainScene);
    this.scene.start("MainScene");
    this.scene.add("ChatScene", ChatScene);
  }
}

window.onload = () => {
  window.game = new Game();
};
