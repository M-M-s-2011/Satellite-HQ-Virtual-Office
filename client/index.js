/** @type {import("../typings/phaser")} */

import "phaser";
import config from "./config/config";
import MainScene from "./scenes/MainScene";

class Game extends Phaser.Game {
  constructor() {
    //this is a test message from LB for their heroku!
    super(config);
    this.scene.add("MainScene", MainScene);
    this.scene.start("MainScene");
  }
}

window.onload = () => {
  window.game = new Game();
};
